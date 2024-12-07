import inquirer from 'inquirer';
import axios from 'axios';
import { CONFIG } from '../utils/config';
import { colors } from '../utils/colors';
import { loadingBarAnimationInfinite, rollupConfigLog } from '../utils/log';

import { getAuthToken } from '../shared/api';
let AUTHEN_TOKEN = '';

export async function RollupdeployCommandCLI(onlyUI = false) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (onlyUI) {
    return;
  }
  console.clear();

  AUTHEN_TOKEN = await getAuthToken();
  if (!AUTHEN_TOKEN) {
    return;
  }

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
    {
      type: 'input',
      name: 'ADMIN_PRIVATE_KEY',
      message: 'Enter the Admin Private Key:',
      validate: (input) =>
        input ? true : 'Admin Private Key cannot be empty.',
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
      default:
        'https://quick-serene-pine.ethereum-holesky.quiknode.pro/a5c5ac0df0f0656d58699a732b567738f0ef6542',
    },
    {
      type: 'number',
      name: 'L1_CHAIN_ID',
      message: 'Enter the L1 Chain ID:',
      validate: (input) => (input ? true : 'L1 Chain ID cannot be empty.'),
      default: 17000,
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
      default: 'https://holesky.beaconcha.in',
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
      default: 'quicknode',
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
      default: 'ETH',
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

  const postData: { [key: string]: any } = {
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

  // trim if there is string all in the object postData
  for (const key in postData) {
    if (typeof postData[key] === 'string') {
      postData[key] = postData[key].trim();
    }
  }

  console.log(postData);

  const loadingRollup = loadingBarAnimationInfinite(
    'Rollup deployment request by API'
  );
  try {
    const res = await axios.post(
      `${CONFIG.DEPLOYMENT_URL}/api/deploy/rollup`,
      postData,
      {
        headers: {
          Authorization: `${AUTHEN_TOKEN}`,
        },
      }
    );
    if (res.status === 200) {
      console.log('🔨 Rollup deployment is building');
      console.log(
        `👩🏻‍💻 Rollup is building if you want to moniter logs use ( opstack-cli logs building )`
      );
    } else {
      console.log(`❌ Rollup deployment is failed :${res.data.message}`);
    }
    clearInterval(loadingRollup);
    return;
  } catch (error : any) {
    console.log('❌ Rollup deployment is failed');
    console.log('Error: ', error.message || error); 
    clearInterval(loadingRollup);
  }
}
