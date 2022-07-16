import chalk from 'chalk';

const logger = {
  debug: (message: string) => {
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
