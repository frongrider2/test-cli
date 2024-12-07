import { getAllDockerPs } from '../shared';
import { getDeploymentStatus } from '../shared/api';

export const StatusCMDCLI = async () => {
  // const backendStatus = await getDeploymentStatus();
  const dockerPs = await getAllDockerPs();
  // console.log(backendStatus);
  console.log(dockerPs);
};
