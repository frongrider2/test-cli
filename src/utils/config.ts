export const CONFIG = {
  DEPLOYMENT_REPO: 'https://github.com/upnodedev/opstack-deployment.git',
  DEPLOYMENT_REPO_VERSION: 'v1.0.0',
};

export const PATH_NAME = {
  DEPLOYMENT_REPO: 'opstack-deployment',
};

export const ENV_DEPLOYMENT_REPO_DEFAULT = {
  USER_NAME: '',
  USER_PASSWORD: '',
  JWT_SECRET: '',

  // database
  POSTGRES_USER: '',
  POSTGRES_PASSWORD: '',
  POSTGRES_DB: 'mydatabase',

  // domain
  DOMAIN_NAME: 'localhost',
  PROTOCOL: 'http',
};

export const DOCKER_COMPOSE_SERVICE = {
  api: {
    backend: 'backend-main',
  },
};
