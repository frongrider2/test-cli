import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

export const createNewEnv = (newEnv: Record<string, any>) => {
  let res = '';
  for (const key in newEnv) {
    res += `${key}=${newEnv[key]}\n`;
  }
  return res;
};

export const mergeDict = (dict1: any, dict2: any) => {
  const res = { ...dict1 };
  for (const key in dict2) {
    if (dict2.hasOwnProperty(key)) {
      res[key] = dict2[key];
    }
  }
  return res;
};

export async function runCommand(command: string) {
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      console.error('Error Output:', stderr);
    }
    return stdout;
  } catch (error) {
    console.error('Command failed:', error);
  }
}
