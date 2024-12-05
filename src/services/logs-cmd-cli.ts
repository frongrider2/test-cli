import { exec } from 'child_process';
import { getDockerCompose, getDockerComposePath } from '../shared';
import { colors } from '../utils/colors';

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
