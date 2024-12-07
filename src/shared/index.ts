import path from 'path';
import { runCommand } from '../utils';
import { CONFIG, PATH_NAME } from '../utils/config';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Get docker-compose version and verify if it is installed
 * @returns {Promise<{dockerCompose: string, isDockerComposeInstalled: boolean}>}
 */
export const getDockerCompose = async () => {
  let dockerCompose = '';
  let isDockerComposeInstalled = false;
  const dockerCompose1Version = await runCommand('docker-compose -v');
  const dockerCompose2Version = await runCommand('docker compose -v');

  if (dockerCompose1Version) {
    dockerCompose = 'docker-compose';
  } else if (dockerCompose2Version) {
    dockerCompose = 'docker compose';
  }

  if (dockerCompose1Version || dockerCompose2Version) {
    isDockerComposeInstalled = true;
  }

  return { dockerCompose, isDockerComposeInstalled };
};

/**
 * Get docker-compose of deployment backend
 * @returns {Promise<string>}
 */
export const getDockerComposePath = async () => {
  const CURRENT_PATH = await runCommand('pwd');
  if (!CURRENT_PATH) {
    console.log('Error getting current path');
    throw new Error('Error getting current path');
  }

  const dockerComposePath = path.join(
    CURRENT_PATH.trim(),
    PATH_NAME.DEPLOYMENT_REPO
  );

  return dockerComposePath;
};

/**
 * Get environment value
 * @param {string} envPath
 * @param {string} envName
 * @returns {Promise<string>}
 */
export const getEnvValue = async (envPath: string, envName: string) => {
  let value = '';
  try {
    const dataEnv = await runCommand(`cat ${envPath}`);
    if (dataEnv) {
      const envs = dataEnv.split('\n');
      envs.forEach((env) => {
        if (env.includes(envName)) {
          value = env.split('=')[1];
        }
      });
    }
  } catch (error) {
    return value;
  }
  return value;
};

/**
 * Get container status
 * @param {string} imageName
 * @returns {Promise<string | undefined>}
 */
export const getDockerContainerStatus = async (imageName: string): Promise<string | undefined> => {
  const dockerStatus = await runCommand(
    `docker ps -a --filter "name=${imageName}" --format "{{.Status}}"`
  );
  return dockerStatus;
};

/**
 * Get deployment status
 * @returns {Promise<boolean>}
 */
export const getDeploymentAPIStatus = async (): Promise<boolean> => {
  let isDeploymentCompleted = false;
  try {
    const data = await axios.get(`${CONFIG.DEPLOYMENT_URL}/api/healthz`);
    if (data.status === 200) {
      isDeploymentCompleted = true;
    }
  } catch (e) {}
  return isDeploymentCompleted;
};

export enum DockerStatus {
  RUNNING = 'RUNNING',
  EXITED = 'EXITED',
  CREATED = 'CREATED',
  PAUSED = 'PAUSED',
  RESTART = 'RESTART',
  UNKNOWN = 'UNKNOWN',
}


/**
 * Function to map Docker status strings to standardized statuses.
 * @param {string} status - The `STATUS` field from `docker ps`.
 * @returns {DockerStatus} - A standardized status like "RUNNING", "EXITED", etc.
 */
function getDockerStatus(status: string): DockerStatus {
  if (!status || typeof status !== 'string') {
    throw new Error('Invalid status input');
  }

  // Normalize and map status
  if (status.startsWith('Up')) {
    return DockerStatus.RUNNING;
  } else if (status.startsWith('Exited')) {
    return DockerStatus.EXITED;
  } else if (status.startsWith('Created')) {
    return DockerStatus.CREATED;
  } else if (status.startsWith('Paused')) {
    return DockerStatus.PAUSED;
  } else if (status.startsWith('Restarting')) {
    return DockerStatus.RESTART;
  } else if (status.startsWith('Dead')) {
    return DockerStatus.EXITED;
  } else {
    return DockerStatus.UNKNOWN;
  }
}

/**
 * Function to get the list of all Docker containers and their statuses.
 * @returns {Promise<{ id: string, image: string, name: string, statusText: string, status: DockerStatus }[]>}
 */
export const getAllDockerPs = async (): Promise<
  {
    id: string;
    image: string;
    name: string;
    statusText: string;
    status: DockerStatus;
  }[]
> => {
  // get container id from docker ps (image, container id, name,status)
  const splitSting = '|~~|';
  const { stdout } = await execPromise(
    `docker ps --format "{{.ID}}${splitSting}{{.Image}}${splitSting}{{.Names}}${splitSting}{{.Status}}"`
  );

  const containerListString = stdout.split('\n');
  containerListString.pop();
  const containerList = containerListString.map((container) => {
    const [id, image, name, statusText] = container.split(splitSting);
    const status = getDockerStatus(statusText);

    return {
      id,
      image,
      name,
      statusText,
      status,
    };
  });
  // console.log(containerList);
  return containerList;
};
