import { exec } from 'child_process';
import { getDockerCompose, getDockerComposePath } from '../shared';
import { colors } from '../utils/colors';
import { ContainerProfileList, ContainerProfileType } from '../types';
import { WS_CLIENT } from '../shared/web-socket-client';
import { getAuthToken, getContainerStatus } from '../shared/api';
import { consoleLogTable } from '../utils';
import inquirer from 'inquirer';

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

/**
 * Get logs of the services
 * @param {ContainerProfileType} service
 */
export async function LogsCmdCLI(service: ContainerProfileType) {
  const token = await getAuthToken();
  const ws = WS_CLIENT(token);
  ws.on('open', () => {
    ws.send(service);

    ws.on('message', (data : any) => {
      // buffer the string format of the data
      const bufferData = Buffer.from(data).toString('utf-8');
      console.log(bufferData);
    });

    ws.on('close', () => {
      // console.log('Disconnected from the server');
    });

    ws.on('error', (error) => {
      // console.log('Error: ', error);
    });
  });

  // Send the service name to the server
}

export async function LogsCmd() {
  console.clear();
  const containerStatus = await getContainerStatus();

  consoleLogTable(containerStatus as any);

  const actionAns = await inquirer.prompt([
    {
      type: 'list',
      name: 'service',
      message: 'Select a service to view logs',
      choices: [
        {
          name: 'All',
          value: 'all',
        },
        ...containerStatus.map((container: any) => {
          return {
            name: `${container.profile} - ${container.name}`,
            value: container.name,
          };
        }),
      ],
    },
  ]);

  if (actionAns.service === 'all') {
    LogsCmdAPICLI({ follow: true, tail: 'all' });
  } else {
    LogsCmdCLI(actionAns.service);
  }
}
