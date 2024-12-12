import { colors } from './colors';
import { CONFIG } from './config';

export const startLog = () => {
  //   console.log(colors.fg.cyan,
  //     `
  // ██╗   ██╗██████╗ ███╗   ██╗ ██████╗ ██████╗ ███████╗
  // ██║   ██║██╔══██╗████╗  ██║██╔═══██╗██╔══██╗██╔════╝
  // ██║   ██║██████╔╝██╔██╗ ██║██║   ██║██║  ██║█████╗
  // ██║   ██║██╔═══╝ ██║╚██╗██║██║   ██║██║  ██║██╔══╝
  // ╚██████╔╝██║     ██║ ╚████║╚██████╔╝██████╔╝███████╗
  //  ╚═════╝ ╚═╝     ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝
  // `,
  //     colors.reset
  //   );

  console.log(
    colors.fg.cyan,
    `
         ██▀███   ▒█████   ██▓     ██▓     █    ██  ██▓███          
        ▓██ ▒ ██▒▒██▒  ██▒▓██▒    ▓██▒     ██  ▓██▒▓██░  ██▒        
        ▓██ ░▄█ ▒▒██░  ██▒▒██░    ▒██░    ▓██  ▒██░▓██░ ██▓▒        
        ▒██▀▀█▄  ▒██   ██░▒██░    ▒██░    ▓▓█  ░██░▒██▄█▓▒ ▒        
 ██▓    ░██▓ ▒██▒░ ████▓▒░░██████▒░██████▒▒▒█████▓ ▒██▒ ░  ░    ██▓ 
 ▒▓▒    ░ ▒▓ ░▒▓░░ ▒░▒░▒░ ░ ▒░▓  ░░ ▒░▓  ░░▒▓▒ ▒ ▒ ▒▓▒░ ░  ░    ▒▓▒ 
 ░▒       ░▒ ░ ▒░  ░ ▒ ▒░ ░ ░ ▒  ░░ ░ ▒  ░░░▒░ ░ ░ ░▒ ░         ░▒  
 ░        ░░   ░ ░ ░ ░ ▒    ░ ░     ░ ░    ░░░ ░ ░ ░░           ░   
  ░        ░         ░ ░      ░  ░    ░  ░   ░                   ░  
  ░                                                              ░  
`,
    colors.reset
  );

  console.log(
    colors.fg.blue,
    '====================================',
    colors.reset
  );
  console.log(
    colors.fg.green,
    `Welcome to Upnode Deploy version : ${CONFIG.DEPLOYMENT_REPO_VERSION}`,
    colors.reset
  );
  console.log(colors.fg.green, 'OP Stack Deployment Tool', colors.reset);
  console.log(
    colors.fg.blue,
    '====================================',
    colors.reset
  );
};

export function loadingBarAnimation(
  duration = 3000,
  totalSteps = 20,
  isLoggingEnabled = true
) {
  let currentStep = 0;

  // Check if logging is enabled
  if (!isLoggingEnabled) return;

  // Calculate the time interval for each step
  const interval = duration / totalSteps;

  const loadingInterval = setInterval(() => {
    // Clear the console for smooth animation (optional)
    console.clear();

    // Generate the loading bar
    const progressBar = `[${'='.repeat(currentStep)}${' '.repeat(
      totalSteps - currentStep
    )}]`;
    const percentage = Math.round((currentStep / totalSteps) * 100);

    console.log(`Loading... ${progressBar} ${percentage}%`);

    // Move to the next step
    currentStep++;

    // Stop the animation when complete
    if (currentStep > totalSteps) {
      clearInterval(loadingInterval);
      console.clear();
      console.log('✅ Loading Complete!');
    }
  }, interval);
}

const loadingSpin = ['|', '/', '-', '\\'];

export function loadingBarAnimationInfinite(
  text = 'Loading',
  duration = 1500,
  totalSteps = 20,
  isLoggingEnabled = true
) {
  let currentStep = 0;

  // Check if logging is enabled
  if (!isLoggingEnabled) return;

  // Calculate the time interval for each step
  const interval = duration / totalSteps;
  let i = 0;
  return setInterval(() => {
    // Clear the console for smooth animation (optional)
    // console.clear();

    // Generate the loading bar
    const progressBar = `[${'='.repeat(currentStep)}${' '.repeat(
      totalSteps - currentStep
    )}]`;
    const percentage = Math.round((currentStep / totalSteps) * 100);

    console.log(
      `${loadingSpin[i]} ${loadingSpin[i]} ${text}... ${progressBar}`
    );

    // Move to the next step
    currentStep = (currentStep + 1) % (totalSteps + 1);
    i = (i + 1) % 4;
  }, interval);
}

export const rollupConfigLog = () => {
  console.log(
    colors.fg.blue,
    '====================================',
    colors.reset
  );
  console.log(colors.fg.green, 'OP Stack Rollup', colors.reset);
  console.log(colors.fg.green, 'Config your rollup', colors.reset);
  console.log(
    colors.fg.blue,
    '====================================',
    colors.reset
  );
};

export const checkpayloadLog = (payload: PayloadInterface) => {
  console.log(
    colors.fg.blue,
    '====================================',
    colors.reset
  );
  console.log(
    colors.fg.blue,
    '====================================',
    colors.reset
  );
};

export interface PayloadInterface {
  BATCHER_PRIVATE_KEY: string;
  PROPOSER_PRIVATE_KEY: string;
  SEQUENCER_PRIVATE_KEY: string;
  DEPLOYER_PRIVATE_KEY: string;
  ADMIN_PRIVATE_KEY: string;
  L1_RPC_URL: string;
  L1_CHAIN_NAME: string;
  L1_CHAIN_ID: number;
  L1_LOGO_URL: string;
  L1_NATIVE_CURRENCY_NAME: string;
  L1_NATIVE_CURRENCY_SYMBOL: string;
  L1_NATIVE_CURRENCY_DECIMALS: number;
  L1_BLOCK_EXPLORER_URL: string;
  L1_BLOCK_EXPLORER_API: string;
  L1_RPC_KIND: string;
  L2_CHAIN_NAME: string;
  L2_CHAIN_ID: number;
  L2_LOGO_URL: string;
  L2_NATIVE_CURRENCY_NAME: string;
  L2_NATIVE_CURRENCY_SYMBOL: string;
  L2_NATIVE_CURRENCY_DECIMALS: number;
  // CELESTIA_RPC: string;
  governanceTokenSymbol: string;
  governanceTokenName: string;
  l2BlockTime: number;
  l2OutputOracleSubmissionInterval: number;
  finalizationPeriodSeconds: number;
  APP_LOGO: string;
  COLOR_PRIMARY: string;
  COLOR_SECONDARY: string;
  WALLETCONNECT_PROJECT_ID: string;
  L1_MULTI_CALL3_ADDRESS: string;
  L1_MULTI_CALL3_BLOCK_CREATED: number;
}
