import { exec } from 'child_process';
import {
  getDeploymentAPIStatus,
  getDockerCompose,
  getDockerComposePath,
} from '../shared';
import fs from 'fs-extra';
import { colors } from '../utils/colors';
import { promisify } from 'util';
import {
  CONFIG,
  ENV_DEPLOYMENT_REPO_DEFAULT,
  PATH_NAME,
} from '../utils/config';
import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import { createNewEnv } from '../utils';
import path from 'path';
import { loadingBarAnimationInfinite } from '../utils/log';

let dockerCompose: string;
const execPromise = promisify(exec);
let check = false;

/**
 * Deploy Rest API
 */
export const apiDeployCmdCli = async () => {
  const deploymentAPIStatus = await getDeploymentAPIStatus();
  const dockerComposePath = await getDockerComposePath();
  const envPath = `${dockerComposePath}/.env`;
  const envExists = await fs.pathExists(envPath);

  const dockerTest = await getDockerCompose();
  dockerCompose = dockerTest.dockerCompose;
  if (!dockerTest.isDockerComposeInstalled) {
    console.log(colors.fg.red, 'Docker Compose is not installed', colors.reset);
    return;
  }

  if (!deploymentAPIStatus && envExists) {
    try {
      await execPromise(`cd ${dockerComposePath} && ${dockerCompose} down`, {
        cwd: dockerComposePath,
      });
      console.log('🔨 Docker Compose down command completed successfully.');
    } catch (error) {
      console.error('❌ Error executing Docker Compose down command:', error);
      throw error;
    }

    try {
      await execPromise(
        `cd ${dockerComposePath} && CURRENT_PATH=${dockerComposePath} ${dockerCompose} up -d --build`,
        {
          cwd: dockerComposePath,
        }
      );
      console.log('🔨 Docker Compose building.');

      check = false;
      while (!check) {
        const deploymentAPIStatusAfter = await getDeploymentAPIStatus();
        if (deploymentAPIStatusAfter) {
          check = true;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log('✅ Deployment Rest API is ready to use');
      return;
    } catch (error) {
      console.error('❌ Error executing Docker Compose up command:', error);
      throw error;
    }
  }

  if (deploymentAPIStatus && envExists) {
    console.log(
      colors.fg.yellow,
      '✅ Deployment Rest API is already running',
      colors.reset
    );
    return;
  }

  if (!deploymentAPIStatus && !envExists) {
    await fs.remove(PATH_NAME.DEPLOYMENT_REPO);
  }

  console.log(`Cloning Deployment Repository...`);
  const git = simpleGit();
  await git.clone(CONFIG.DEPLOYMENT_REPO, PATH_NAME.DEPLOYMENT_REPO, [
    '--branch',
    CONFIG.DEPLOYMENT_REPO_VERSION,
  ]);
  console.log('Project setup complete!');
  const env_deployment_repo = { ...ENV_DEPLOYMENT_REPO_DEFAULT };
  env_deployment_repo.JWT_SECRET = Math.random().toString(36).substring(2, 15);
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'user_name',
      message: 'Enter the user name of database:',
      validate: (input) => (input ? true : 'User name cannot be empty.'),
      default: 'admin',
    },
    {
      type: 'input',
      name: 'user_password',
      message: 'Enter the user password of database:',
      validate: (input) => (input ? true : 'User password cannot be empty.'),
      default: 'pass1234',
    },
    {
      type: 'input',
      name: 'domain_name',
      message:
        'Enter the domain name (Example : localhost , example.com , test.app) :',
      validate: (input) => (input ? true : 'Domain name cannot be empty.'),
      default: 'localhost',
    },
    // select protocol http or https
    {
      type: 'list',
      name: 'protocol',
      message: 'Select protocol for domain',
      choices: ['http', 'https'],
      default: 'http',
    },
  ]);

  const { is_correct } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'is_correct',
      message: 'Is the above information correct?',
    },
  ]);

  if (!is_correct) {
    console.log(colors.fg.red, 'Please run the command again', colors.reset);
    return;
  }

  env_deployment_repo.USER_NAME = answers.user_name;
  env_deployment_repo.USER_PASSWORD = answers.user_password;
  env_deployment_repo.DOMAIN_NAME = answers.domain_name;
  env_deployment_repo.PROTOCOL = answers.protocol;
  env_deployment_repo.POSTGRES_USER = answers.user_name;
  env_deployment_repo.POSTGRES_PASSWORD = answers.user_password;

  // create .env file
  const envDeploymentApiPath = path.join(PATH_NAME.DEPLOYMENT_REPO, '.env');
  const envDeploymentApi = createNewEnv({ ...env_deployment_repo });
  fs.writeFileSync(envDeploymentApiPath, envDeploymentApi);
  await new Promise((resolve) => setTimeout(resolve, 100));

  const loading = loadingBarAnimationInfinite(
    '🚀 Deployment Rest API is in progress'
  );

  try {
    await execPromise(
      `cd ${dockerComposePath} && CURRENT_PATH=${dockerComposePath} ${dockerCompose} up -d --build`,
      {
        cwd: dockerComposePath,
      }
    );
    clearInterval(loading);
    console.log('🔨 Docker Compose building.');
  } catch (error) {
    console.error('❌ Error executing Docker Compose down command:', error);
    clearInterval(loading);
    throw error;
  }
  check = false;

  while (!check) {
    const deploymentAPIStatusAfter = await getDeploymentAPIStatus();
    if (deploymentAPIStatusAfter) {
      check = true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('✅ Deployment Rest API is ready to use');
  console.log(
    `Deployment UI: `,
    colors.fg.green,
    `${answers.protocol}://deploy.${answers.domain_name}`,
    colors.reset
  );
  console.log(
    `Deployment Rest API: `,
    colors.fg.green,
    `${answers.protocol}://deploy-api.${answers.domain_name}`,
    colors.reset
  );
};
