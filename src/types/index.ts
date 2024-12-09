export enum DockerStatus {
  RUNNING = 'RUNNING',
  EXITED = 'EXITED',
  CREATED = 'CREATED',
  PAUSED = 'PAUSED',
  RESTART = 'RESTART',
  UNKNOWN = 'UNKNOWN',
}

export enum ContainerProfile {
  deployment = 'Deployment',
  rollup = 'Rollup',
  logging = 'Logging',
  bridge = 'Bridge',
  blockscout = 'Blockscout',
  unknow = 'Unknown',
}

export const ContainerProfileList = {
  [ContainerProfile.deployment]: [
    'deployment-traefik',
    'deployment-db',
    'deployment-backend',
    'deployment-frontend',
  ],
  [ContainerProfile.rollup]: [
    'force-clone',
    'celestia-da',
    'op-geth',
    'op-node',
    'op-batcher',
    'op-proposer',
  ],
  [ContainerProfile.logging]: ['grafana', 'prometheus'],
  [ContainerProfile.bridge]: [
    'bridge-indexer-db',
    'bridge-indexer-deposit',
    'bridge-indexer-withdrawal',
    'bridge-indexer-server',
    'bridge-indexer-frontend',
  ],
  [ContainerProfile.blockscout]: [
    'blockscout-redis-db',
    'blockscout-db-init',
    'blockscout-db',
    'blockscout-backend',
    'blockscout-visualizer',
    'blockscout-sig-provider',
    'blockscout-frontend',
    'blockscout-stats-db-init',
    'blockscout-stats-db',
    'blockscout-stats',
    'blockscout-user-ops-indexer',
    'blockscout-proxy',
  ],
};

export type ContainerProfileType =
  | 'deployment-traefik'
  | 'deployment-db'
  | 'deployment-backend'
  | 'deployment-frontend'
  | 'force-clone'
  | 'celestia-da'
  | 'op-geth'
  | 'op-node'
  | 'op-batcher'
  | 'op-proposer'
  | 'grafana'
  | 'prometheus'
  | 'bridge-indexer-db'
  | 'bridge-indexer-deposit'
  | 'bridge-indexer-withdrawal'
  | 'bridge-indexer-server'
  | 'bridge-indexer-frontend'
  | 'blockscout-redis-db'
  | 'blockscout-db-init'
  | 'blockscout-db'
  | 'blockscout-backend'
  | 'blockscout-visualizer'
  | 'blockscout-sig-provider'
  | 'blockscout-frontend'
  | 'blockscout-stats-db-init'
  | 'blockscout-stats-db'
  | 'blockscout-stats'
  | 'blockscout-user-ops-indexer'
  | 'blockscout-proxy';
