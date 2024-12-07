import inquirer from 'inquirer';
import { getDockerComposePath } from '../shared';
import { colors } from '../utils/colors';
import fs from 'fs';

export const InfoCMDCLI = async () => {
  console.clear();
  // console.log(path)
  console.log('------------------');
  console.log(colors.fg.magenta, 'Chain Info', colors.reset);
  console.log('------------------');

  console.log(colors.fg.magenta, 'Path of config file', colors.reset);
  const dockerComposePath = await getDockerComposePath();

  console.log(
    'Data Volume path: ',
    colors.fg.yellow,
    `${dockerComposePath}/data`,
    colors.reset
  );
  console.log(
    'deploy-config path: ',
    colors.fg.yellow,
    `${dockerComposePath}/data/configurations/deploy-config.json`,
    colors.reset
  );
  console.log(
    'rollup.json path: ',
    colors.fg.yellow,
    `${dockerComposePath}/data/configurations/rollup.json`,
    colors.reset
  );
  console.log(
    'genesis.json path: ',
    colors.fg.yellow,
    `${dockerComposePath}/data/configurations/genesis.json`,
    colors.reset
  );
  console.log(
    'allocs.json path: ',
    colors.fg.yellow,
    `${dockerComposePath}/data/deployments/allocs.json`,
    colors.reset
  );
  console.log(
    'allocs.json path: ',
    colors.fg.yellow,
    `${dockerComposePath}/data/deployments/artifact.json`,
    colors.reset
  );
  console.log('------------------');
  await readConfigJson();
};

export const readConfigJson = async () => {
  const dockerComposePath = await getDockerComposePath();
  const actionAns = await inquirer.prompt([
    // list choice with description
    {
      type: 'list',
      name: 'action',
      message: '⚙️ Select the config to look up',
      choices: [
        {
          name: '1) deploy-config.json',
          value: 'deploy-config.json',
        },
        {
          name: '2) rollup.json',
          value: 'rollup.json',
        },
        {
          name: '3) genesis.json',
          value: 'genesis.json',
        },
        {
          name: '4) allocs.json',
          value: 'allocs.json',
        },
        {
          name: '5) artifact.json (Layer 1 Contract addresses)',
          value: 'artifact.json',
        },
      ],
    },
  ]);

  console.log(actionAns.action);
  let filePath = `${dockerComposePath}/data/configurations/${actionAns.action}`;
  if (
    actionAns.action === 'artifact.json' ||
    actionAns.action === 'allocs.json'
  ) {
    filePath = `${dockerComposePath}/data/deployments/${actionAns.action}`;
  }
  const data = await readConfigJsonFile(filePath);
  if (!data) {
    console.log('❌ File not found', filePath);
  } else {
    console.log('------------------');
    console.log(colors.fg.magenta, actionAns.action, colors.reset);
    console.log('------------------');
    console.log(data);
  }

  await readConfigJson();
};

export const readConfigJsonFile = async (filePath: string) => {
  // read the file and display the content if the file exists
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    await new Promise((resolve) => setTimeout(resolve, 100));

    return JSON.parse(data);
  } catch (error) {
    return undefined;
  }
};
