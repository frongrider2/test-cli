import inquirer from 'inquirer';
import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import axios from 'axios';
import { CONFIG, ENV_DEPLOYMENT_REPO_DEFAULT, PATH_NAME } from '../utils/config';
import { colors } from '../utils/colors';
import { createNewEnv, runCommand } from '../utils';
import { loadingBarAnimationInfinite, rollupConfigLog, startLog } from '../utils/log';

let dockerCompose = 'docker-compose';
let AUTHEN_TOKEN = '';

export async function runCommandCLI() {
  // delete existing deployment repo
  console.log('Deleting Existing Deployment Repository...');
  await fs.remove(PATH_NAME.DEPLOYMENT_REPO);
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log(`Cloning Deployment Repository...`);
  const git = simpleGit();
  await git.clone(CONFIG.DEPLOYMENT_REPO, PATH_NAME.DEPLOYMENT_REPO, [
    '--branch',
    CONFIG.DEPLOYMENT_REPO_VERSION,
  ]);
  console.log('Project setup complete!');

  // create ENV file
  const env_deployment_repo = { ...ENV_DEPLOYMENT_REPO_DEFAULT };

  env_deployment_repo.JWT_SECRET = Math.random().toString(36).substring(2, 15);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'user_name',
      message: 'Enter the user name of database:',
      validate: (input) => (input ? true : 'User name cannot be empty.'),
      default: 'postgres',
    },
    {
      type: 'input',
      name: 'user_password',
      message: 'Enter the user password of database:',
      validate: (input) => (input ? true : 'User password cannot be empty.'),
      default: 'password',
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

  // recheck the answers
  const { user_name, user_password } = answers;

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

  // run docker compose
  console.log('Running Docker Compose...');
  const CURRENT_PATH = await runCommand('pwd');
  if (!CURRENT_PATH) {
    console.log('Error getting current path');
    return;
  }

  const dockerComposePath = path.join(
    CURRENT_PATH.trim(),
    PATH_NAME.DEPLOYMENT_REPO
  );

  // check docker version
  const dockerVersion = await runCommand('docker -v');
  if (!dockerVersion) {
    console.log(colors.fg.red, 'Docker is not installed', colors.reset);
    return;
  }
  // check docker compose version
  const dockerCompose1Version = await runCommand('docker-compose -v');
  const dockerCompose2Version = await runCommand('docker compose -v');

  if (dockerCompose1Version) {
    dockerCompose = 'docker-compose';
  } else if (dockerCompose2Version) {
    dockerCompose = 'docker compose';
  } else {
    console.log(colors.fg.red, 'Docker Compose is not installed', colors.reset);
    return;
  }

  const loading = loadingBarAnimationInfinite(
    'Deployment Rest API is in progress'
  );

  const deploymentCompose = exec(
    `cd ${dockerComposePath} && CURRENT_PATH=${dockerComposePath} ${dockerCompose} up -d --build`,
    { cwd: dockerComposePath }
  );

  let isDeploymentCompleted = false;
  deploymentCompose.stdout?.on('data', (data) => {
    // console.log(data);
  });
  deploymentCompose.stderr?.on('data', (data) => {
    // console.log(data);
  });
  deploymentCompose.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    if (code === 0) {
      // console.log(colors.fg.green, 'Deployment is completed', colors.reset);
      // isDeploymentCompleted = true;
      clearInterval(loading);
      // console.clear();
    } else {
      console.log(colors.fg.red, 'Deployment is failed', colors.reset);
    }
  });

  // wait for deployment to complete

  while (!isDeploymentCompleted) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const data = await axios.get('http://localhost:3050/api/healthz');
      if (data.status === 200) {
        isDeploymentCompleted = true;
      }
    } catch (e) {
      // console.log('Error
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log(
    colors.fg.green,
    '✅ Deployment Rest API is completed',
    colors.reset
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.clear();

  try {
    const data = await axios.post('http://localhost:3050/api/auth/login', {
      username: user_name,
      password: user_password,
    });
    if (data.status === 200) {
      AUTHEN_TOKEN = data.data.token;
    } else {
      console.log('❌ Authentication is failed');
      return;
    }
  } catch (e) {
    console.log('Error: ', e);
  }
  // console.log('AUTHEN_TOKEN', AUTHEN_TOKEN);

  rollupConfigLog();
  console.log(colors.fg.yellow, 'Config your Wallet', colors.reset);
  const privateKeyForm = await inquirer.prompt([
    {
      type: 'input',
      name: 'BATCHER_PRIVATE_KEY',
      message: 'Enter the Batcher Private Key:',
      validate: (input) =>
        input ? true : 'Batcher Private Key cannot be empty.',
      default: '0x',
    },
    {
      type: 'input',
      name: 'PROPOSER_PRIVATE_KEY',
      message: 'Enter the Proposer Private Key:',
      validate: (input) =>
        input ? true : 'Proposer Private Key cannot be empty.',
      default: '0x',
    },
    {
      type: 'input',
      name: 'SEQUENCER_PRIVATE_KEY',
      message: 'Enter the Sequencer Private Key:',
      validate: (input) =>
        input ? true : 'Sequencer Private Key cannot be empty.',
      default: '0x',
    },
    {
      type: 'input',
      name: 'DEPLOYER_PRIVATE_KEY',
      message: 'Enter the Deployer Private Key:',
      validate: (input) =>
        input ? true : 'Deployer Private Key cannot be empty.',
      default: '0x',
    },
  ]);
  console.log(colors.fg.yellow, 'Config your Layer 1', colors.reset);
  const L1Form = await inquirer.prompt([
    {
      type: 'input',
      name: 'L1_RPC_URL',
      message: 'Enter the L1 RPC URL:',
      validate: (input) => (input ? true : 'L1 RPC URL cannot be empty.'),
      default: 'https://eth.llamarpc.com',
    },
    {
      type: 'number',
      name: 'L1_CHAIN_ID',
      message: 'Enter the L1 Chain ID:',
      validate: (input) => (input ? true : 'L1 Chain ID cannot be empty.'),
      default: 1,
    },
    {
      type: 'input',
      name: 'L1_CHAIN_NAME',
      message: 'Enter the L1 Chain Name:',
      validate: (input) => (input ? true : 'L1 Chain Name cannot be empty.'),
      default: 'Ethereum mainnet',
    },
    {
      type: 'input',
      name: 'L1_LOGO_URL',
      message: 'Enter the L1 Logo URL:',
      validate: (input) => (input ? true : 'L1 Logo URL cannot be empty.'),
      default: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
    {
      type: 'input',
      name: 'L1_NATIVE_CURRENCY_NAME',
      message: 'Enter the L1 Native Currency Name:',
      validate: (input) =>
        input ? true : 'L1 Native Currency Name cannot be empty.',
      default: 'Ethereum',
    },
    {
      type: 'input',
      name: 'L1_NATIVE_CURRENCY_SYMBOL',
      message: 'Enter the L1 Native Currency Symbol:',
      validate: (input) =>
        input ? true : 'L1 Native Currency Symbol cannot be empty.',
      default: 'ETH',
    },
    {
      type: 'input',
      name: 'L1_NATIVE_CURRENCY_DECIMALS',
      message: 'Enter the L1 Native Currency Decimals:',
      validate: (input) =>
        input ? true : 'L1 Native Currency Decimals cannot be empty.',
      default: '18',
    },
    {
      type: 'input',
      name: 'L1_BLOCK_EXPLORER_URL',
      message: 'Enter the L1 Block Explorer URL:',
      validate: (input) =>
        input ? true : 'L1 Block Explorer URL cannot be empty.',
      default: 'https://etherscan.io',
    },
    {
      type: 'input',
      name: 'L1_BLOCK_EXPLORER_API',
      message: 'Enter the L1 Block Explorer API:',
      validate: (input) =>
        input ? true : 'L1 Block Explorer API cannot be empty.',
      default: 'https://api.etherscan.io/api',
    },
    {
      type: 'list',
      name: 'L1_RPC_KIND',
      message: 'Select RPC Kind for L1',
      choices: [
        'alchemy',
        'quicknode',
        'infura',
        'parity',
        'nethermind',
        'debug_geth',
        'erigon',
        'basic',
        'any',
      ],
    },
    {
      type: 'input',
      name: 'L1_MULTI_CALL3_ADDRESS',
      message: 'Enter the L1 Multi Call3 Address:',
      validate: (input) =>
        input ? true : 'L1 Multi Call3 Address cannot be empty.',
      default: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
    {
      type: 'number',
      name: 'L1_MULTI_CALL3_BLOCK_CREATED',
      message: 'Enter the L1 Multi Call3 Block Created:',
      validate: (input) =>
        input ? true : 'L1 Multi Call3 Block Created cannot be empty.',
      default: 77,
    },
  ]);

  console.log(colors.fg.yellow, 'Config your Rollup', colors.reset);
  const rollupForm = await inquirer.prompt([
    {
      type: 'input',
      name: 'L2_CHAIN_NAME',
      message: 'Enter the Rollup Name (Chain name):',
      validate: (input) =>
        input ? true : 'Rollup Name (Chain name) cannot be empty.',
      default: 'Optimism',
    },
    {
      type: 'number',
      name: 'L2_CHAIN_ID',
      message: 'Enter the Rollup Chain ID:',
      validate: (input) => (input ? true : 'Rollup Chain ID cannot be empty.'),
      default: 43333,
    },
    {
      type: 'input',
      name: 'L2_LOGO_URL',
      message: 'Enter the Rollup Logo URL:',
      validate: (input) => (input ? true : 'Rollup Logo URL cannot be empty.'),
      default: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
    },
    {
      type: 'input',
      name: 'L2_NATIVE_CURRENCY_NAME',
      message: 'Enter the Rollup Native Currency Name:',
      validate: (input) =>
        input ? true : 'Rollup Native Currency Name cannot be empty.',
      default: 'Optimism Ethereum',
    },
    {
      type: 'input',
      name: 'L2_NATIVE_CURRENCY_SYMBOL',
      message: 'Enter the Rollup Native Currency Symbol:',
      validate: (input) =>
        input ? true : 'Rollup Native Currency Symbol cannot be empty.',
      default: 'OETH',
    },
    {
      type: 'input',
      name: 'L2_NATIVE_CURRENCY_DECIMALS',
      message: 'Enter the Rollup Native Currency Decimals:',
      validate: (input) =>
        input ? true : 'Rollup Native Currency Decimals cannot be empty.',
      default: '18',
    },
    {
      type: 'input',
      name: 'governanceTokenName',
      message: 'Enter the Governance Token Name:',
      validate: (input) =>
        input ? true : 'Governance Token Name cannot be empty.',
      default: 'Optimism',
    },
    {
      type: 'input',
      name: 'governanceTokenSymbol',
      message: 'Enter the Governance Token Symbol:',
      validate: (input) =>
        input ? true : 'Governance Token Symbol cannot be empty.',
      default: 'OP',
    },
    {
      type: 'number',
      name: 'l2BlockTime',
      message:
        'Number of seconds between each L2 block. Must be < L1 block time:',
      validate: (input) => (input ? true : 'l2BlockTime cannot be empty.'),
      default: 2,
    },
    {
      type: 'number',
      name: 'l2OutputOracleSubmissionInterval',
      message: 'Number of blocks between proposals to the L2OutputOracle:',
      validate: (input) =>
        input ? true : 'l2OutputOracleSubmissionInterval cannot be empty.',
      default: 90,
    },
    {
      type: 'number',
      name: 'finalizationPeriodSeconds',
      message:
        'Number of seconds that a proposal must be available to challenge before it is considered finalized by the OptimismPortal contract:',
      validate: (input) =>
        input ? true : 'l2OutputOracleSubmissionInterval cannot be empty.',
      default: 300,
    },
  ]);

  console.log(
    colors.fg.yellow,
    'Config your bridge user interface',
    colors.reset
  );
  const bridgeUIForm = await inquirer.prompt([
    {
      type: 'input',
      name: 'APP_LOGO',
      message: 'Enter the App Logo URL:',
      validate: (input) => (input ? true : 'App Logo URL cannot be empty.'),
      default: 'https://i.ibb.co/r36YpbK/upnode.png',
    },
    // input color
    {
      type: 'input',
      name: 'COLOR_PRIMARY',
      message: 'Enter the Primary Color:',
      validate: (input) => (input ? true : 'Primary Color cannot be empty.'),
      default: '#27005D',
    },
    {
      type: 'input',
      name: 'COLOR_SECONDARY',
      message: 'Enter the Secondary Color:',
      validate: (input) => (input ? true : 'Secondary Color cannot be empty.'),
      default: '#9EDDFF',
    },
    {
      type: 'input',
      name: 'WALLETCONNECT_PROJECT_ID',
      message: 'Enter the WalletConnect Project ID:',
      validate: (input) =>
        input ? true : 'WalletConnect Project ID cannot be empty.',
      default: '00000',
    },
  ]);

  const COLOR_PRIMARY = `'${bridgeUIForm.COLOR_PRIMARY}'`;
  const COLOR_SECONDARY = `'${bridgeUIForm.COLOR_SECONDARY}'`;

  const postData = {
    ...privateKeyForm,
    ...L1Form,
    ...rollupForm,
    ...bridgeUIForm,
    COLOR_PRIMARY,
    COLOR_SECONDARY,
  };
  const { is_correct: confirmPostdata } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'is_correct',
      message: 'Is the above information correct?',
    },
  ]);

  if (!confirmPostdata) {
    console.log(colors.fg.red, 'Please run the command again', colors.reset);
    return;
  }

  try {
    const loadingRollup = loadingBarAnimationInfinite(
      'Rollup deployment request by API'
    );
    const res = await axios.post(
      'http://localhost:3050/api/deploy/rollup',
      postData,
      {
        headers: {
          Authorization: `${AUTHEN_TOKEN}`,
        },
      }
    );
    if (res.status === 200) {
      console.log('✅ Rollup deployment is building');
      console.log(
        `👩🏻‍💻 Rollup is building if you want to moniter logs use ( opstack-cli logs building )`
      );
    } else {
      console.log(`❌ Rollup deployment is failed :${res.data.message}`);
    }
    clearInterval(loadingRollup);
    return;
  } catch (error) {
    console.log('❌ Rollup deployment is failed');
    console.log('Error: ', error);
  }
}
