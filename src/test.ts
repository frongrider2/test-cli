import { StatusCMDCLI } from './services/status-cmd-cli';
import { getContainerStatus } from './shared/api';
import { consoleLogTable } from './utils';

StatusCMDCLI().then(async () => {
  const data = [
    {
      id: '36cad92ee6ce',
      image: 'opstack-deployment-frontend-main',
      name: 'deployment-frontend',
      statusText: 'Up 31 minutes',
      status: 'RUNNING',
      profile: 'Deployment',
    },
    {
      id: 'f4eff0f73973',
      image: 'opstack-deployment-backend-main',
      name: 'deployment-backend',
      statusText: 'Up 31 minutes',
      status: 'RUNNING',
      profile: 'Deployment',
    },
    {
      id: '89e4b1153d1d',
      image: 'traefik-envsubst',
      name: 'deployment-traefik',
      statusText: 'Up 31 minutes',
      status: 'RUNNING',
      profile: 'Deployment',
    },
    {
      id: 'b3f74a505453',
      image: 'postgres:13',
      name: 'deployment-db',
      statusText: 'Up 31 minutes (healthy)',
      status: 'RUNNING',
      profile: 'Deployment',
    },
  ];

  consoleLogTable(data);
});
