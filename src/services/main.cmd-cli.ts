import inquirer from 'inquirer';
import { RollupdeployCommandCLI } from './rollup-deploy-cmd-cli';
import { apiDeployCmdCli } from './api-deploy-cmd-cli';
import { InfoCMDCLI } from './info.cmd-cmd';

enum Action {
  deployUI = 'deployUI',
  deploy = 'deploy',
  logs = 'logs',
  import = 'import',
  status = 'status',
  backup = 'backup',
  backupConfig = 'backupConfig',
  delete = 'delete',
  chainInfo = 'chainInfo',
  exit= 'exit',
}

export const mainCMDCLI = async () => {
  await apiDeployCmdCli();
  // select the command

  const actionAns = await inquirer.prompt([
    // list choice with description
    {
      type: 'list',
      name: 'action',
      message: '🚀 Select the action',
      choices: [
        {
          name: '1) Launch Deployment UI',
          value: Action.deployUI,
        },
        {
          name: '2) Deploy Opstack Rollup include (Deployment UI, Grafana, Blockscout, Bridge UI)',
          value: Action.deploy,
        },
        {
          name: '3) Import existing OP Stack deployment',
          value: Action.import,
        },
        {
          name: '4) Chain Info',
          value: Action.chainInfo,
        },
        {
          name: '5) Status of the deployment',
          value: Action.status,
        },
        {
          name: '6) View logs',
          value: Action.logs,
        },
        {
          name: '6) Backup Config',
          value: Action.backupConfig,
        },
        {
          name: '7) Backup Data Snapshot',
          value: Action.backup,
        },
        {
          name: '8) Delete Chain',
          value: Action.delete,
        },
        {
          name: '9) Exit',
          value: Action.exit,
        },
      ],
    },
  ]);

  const action = actionAns.action as Action;

  switch (action) {
    case Action.deployUI:
      await RollupdeployCommandCLI(true);
      break;
    case Action.deploy:
      await RollupdeployCommandCLI(false);
      break;
    case Action.import:
      console.log('Importing');
      break;
    case Action.chainInfo:
      await InfoCMDCLI();
      break;
    case Action.status:
      console.log('Status');
      break;
    case Action.logs:
      console.log('Logs');
      break;
    case Action.backupConfig:
      console.log('Backup Config');
      break;
    case Action.backup:
      console.log('Backup');
      break;
    case Action.delete:
      console.log('Delete');
      break;
    case Action.exit:
      console.log('Exit');
      break;
  }
};
