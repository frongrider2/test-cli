#!/usr/bin/env node

import { Command } from 'commander';
import { startLog } from './utils/log';

import { runCommandCLI } from './services/runCommandCLI';

const program = new Command();

program
  .name('opstack-cli')
  .description('A CLI tool for manage opstack deployment')
  .version('1.0.0');

program.command('run').description('Run Opstack Rollup').action(runCommandCLI);

program.parse(process.argv);
startLog();
