import axios from 'axios';
import { getDockerComposePath, getEnvValue } from '.';
import path from 'path';

/**
 * Get authentication token
 * @returns {Promise<string>}
 */
export const getAuthToken = async () => {
  let AUTHEN_TOKEN = '';
  const dockerComposePath = await getDockerComposePath();
  const envPath = path.join(dockerComposePath, '.env');
  // get username and password read from envPath
  const username = await getEnvValue(envPath, 'USER_NAME');
  const password = await getEnvValue(envPath, 'USER_PASSWORD');
  if (!username || !password) {
    console.log('❌ Username or password is not found');
    return AUTHEN_TOKEN;
  }
  try {
    const data = await axios.post('http://localhost:3050/api/auth/login', {
      username,
      password,
    });
    if (data.status === 200) {
      AUTHEN_TOKEN = data.data.token;
    } else {
      console.log('❌ Authentication is failed');
    }
  } catch (e) {
    console.log('Error: ', e);
  }

  return AUTHEN_TOKEN;
};

export const getDeploymentStatus = async () => {
  let status = '';
  const token = getAuthToken();
  if (!token) {
    throw new Error('❌ Token is not found');
  }
  try {
    const data = await axios.get('http://localhost:3050/api/deploy/status');
    if (data.status === 200) {
      status = data.data.status;
    } else {
      console.log('❌ Get deployment status is failed');
    }
  } catch (e) {
    console.log('Error: ', e);
  }

  return status;
};
