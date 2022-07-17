import chalk from 'chalk';

const debugMode = process.env.DEBUGMODE === 'true';

const logger = {
  debug: (message: string) => {
    if (!debugMode) return;
    console.log(
      chalk.gray(new Date().toLocaleString()) +
        ' ' +
        chalk.blue('[DEBUG]') +
        ' ' +
        message
    );
  },
  info: (message: string) => {
    console.log(
      chalk.gray(new Date().toLocaleString()) +
        ' ' +
        chalk.green('[INFO]') +
        ' ' +
        message
    );
  },
  error: (message: string) => {
    console.log(
      chalk.gray(new Date().toLocaleString()) +
        ' ' +
        chalk.red('[ERROR]') +
        ' ' +
        message
    );
  }
};

export default logger;
