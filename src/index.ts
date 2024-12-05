#!/usr/bin/env node

import { Command } from 'commander';
import { startLog } from './utils/log';

import { LogsCmdAPICLI } from './services/logs-cmd-cli';
import { mainCMDCLI } from './services/main.cmd-cli';
import { apiDeployCmdCli } from './services/api-deploy-cmd-cli';


startLog();
const program = new Command();

program
  .name('opstack-cli')
  .description('A CLI tool for manage opstack deployment')
  .version('1.0.0');

program.command('run').description('Run Opstack CLI Tool').action(mainCMDCLI);
program
  .command('api')
  .description('Run Opstack CLI API')
  .action(apiDeployCmdCli);
program
  .command('logs build')
  .description('View logs from Docker Compose services')
  .option('-f, --follow', 'Follow log output')
  .option(
    '-t, --tail <lines>',
    'Number of lines to show from the end of the logs',
    'all'
  )
  .action(LogsCmdAPICLI);

program.parse(process.argv);
