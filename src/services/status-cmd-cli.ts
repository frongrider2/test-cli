import { getAllDockerPs } from '../shared';
import { getDeploymentStatus } from '../shared/api';
import { consoleLogTable } from '../utils';

export const StatusCMDCLI = async () => {
  // const backendStatus = await getDeploymentStatus();
  const dockerPs = await getAllDockerPs();
  // console.log(backendStatus);
  consoleLogTable(dockerPs);
};
