import { exec } from 'child_process';
import { getDockerCompose, getDockerComposePath } from '../shared';
import { colors } from '../utils/colors';
import WebSocket from 'ws';
import blessed from 'blessed';
import { getAuthToken, getContainerStatus } from '../shared/api';
import { CONFIG } from '../utils/config';

let ws: WebSocket | null = null;

/**
 * Get logs of the services
 * @param {any} options
 */
export async function LogsCmdAPICLI(options: any) {
  const followFlag = options.follow ? '-f' : '';
  const tailFlag = options.tail !== 'all' ? `--tail ${options.tail}` : '';
  const command = `docker compose logs ${followFlag} ${tailFlag}`;

  const dockerTest = await getDockerCompose();
  const dockerCompose = dockerTest.dockerCompose;
  if (!dockerTest.isDockerComposeInstalled) {
    console.log(colors.fg.red, 'Docker Compose is not installed', colors.reset);
    return;
  }

  const dockerComposePath = await getDockerComposePath();

  const LogsCompose = exec(
    `cd ${dockerComposePath} && CURRENT_PATH=${dockerComposePath} ${dockerCompose} logs ${followFlag} ${tailFlag}`,
    { cwd: dockerComposePath }
  );

  let keepRunning = true;
  LogsCompose.stdout?.on('data', (data) => {
    console.log(data);
  });

  LogsCompose.stderr?.on('data', (data) => {
    console.log(data);
  });

  LogsCompose.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  LogsCompose.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
    keepRunning = false;
  });

  LogsCompose.on('disconnect', () => {
    console.log('child process disconnected');
  });

  while (keepRunning) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export async function LogsCmd() {
  console.clear();

  // Create a screen
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Service Viewer',
  });
  // screen.enableInput();
  const token = await getAuthToken('admin', 'pass1234');
  const containerStatus = await getContainerStatus(token);
  const items = containerStatus.map((status) => status.name);

  // Service List
  const serviceList = blessed.list({
    top: 0,
    left: 0,
    width: '30%',
    height: '100%',
    label: ' Services ',
    border: { type: 'line' },
    style: {
      selected: { bg: 'blue', fg: 'white' },
      border: { fg: 'cyan' },
    },
    keys: true, // Enable keyboard navigation
    mouse: true, // Optional: Enable mouse interaction
    items: items,
  });

  // Log Status
  const logStatus = blessed.box({
    top: 0,
    left: '30%',
    width: '70%',
    height: '20%',
    label: 'Status',
    border: { type: 'line' },
    scrollable: true,
    alwaysScroll: true,
    style: { border: { fg: 'yellow' } },
  });

  // Log Viewer
  const logViewer = blessed.box({
    top: '20%',
    left: '30%',
    width: '70%',
    height: '80%',
    label: ' Logs ',
    border: { type: 'line' },
    scrollable: true,
    alwaysScroll: true,
    style: { border: { fg: 'green' } },
  });

  // Append widgets to the screen
  screen.append(serviceList);
  screen.append(logStatus);
  screen.append(logViewer);
  // Focus on the service list
  serviceList.focus();

  async function connectToService(service: string) {
    if (ws) {
      ws.close();
    }

    // await new Promise((resolve) => setTimeout(resolve, 500));

    const logStatusContent = await getContainerStatus(token);
    const selectedService = logStatusContent.find(
      (status) => status.name === service
    );
    if (selectedService) {
      logStatus.setContent(
        `Service: ${selectedService.name}\nStatus: ${selectedService.status}`
      );
    }

    logViewer.setContent(`Connecting to ${service}...`);
    screen.render();

    ws = new WebSocket(`${CONFIG.DEPLOYMENT_WS_URL}?token=${token}`);

    ws.on('open', () => {
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(service); // Send the service name to the WebSocket server
          logViewer.setContent(`Connected to ${service}. Waiting for logs...`);
          screen.render();
        }
      }
    });

    ws.on('message', (data) => {
      logViewer.setContent(logViewer.getContent() + data.toString() + '\n');
      logViewer.setScrollPerc(100); // Auto-scroll to the bottom
      screen.render();
    });

    // ws.on('error', (err) => {
    //   logViewer.setContent(`Error: ${err.message}`);
    //   screen.render();
    // });

    // ws.on('close', () => {
    //   logViewer.setContent(`Disconnected from ${service}`);
    //   screen.render();
    // });
  }

  // Handle selection and key events
  serviceList.on('select', async (item) => {
    const service = item.getText();
    await connectToService(service);
  });

  serviceList.key(['up', 'down'], () => {
    screen.render(); // Ensure the screen refreshes after moving selection
  });

  // Quit on Escape, q, or Control-C
  screen.key(['escape', 'q', 'C-c'], () => {
    if (ws) {
      ws.close();
    }
    return process.exit(0);
  });

  // Render the screen
  screen.render();

  process.stdin.on('data', (chunk) => {
    // Suppress raw escape sequences like `^[OB`
    if (chunk.toString().startsWith('\u001b')) {
      return;
    }
  });
}
