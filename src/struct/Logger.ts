import chalk from 'chalk';
import fs from 'fs';

export class Logger {
  constructor() {
    this.debugMode = process.env.DEBUGMODE === 'true';
    this.logFile =
      process.env.SAVELOGS === 'true' ? this.createLogFile() : null;
  }

  public debugMode: boolean;
  public logFile: fs.WriteStream;


  public debug = (message: string): void => {
    if (!this.debugMode) return;
    console.log(
      chalk.gray(new Date().toLocaleString()) +
        ' ' +
        chalk.blue('[DEBUG]') +
        ' ' +
        message
    );
    if (this.logFile) {
      this.logFile.write(
        new Date().toLocaleString() + ' [DEBUG] ' + message + '\n'
      );
    }
  };

  public info = (message: string): void => {
    console.log(
      chalk.gray(new Date().toLocaleString()) +
        ' ' +
        chalk.green('[INFO]') +
        ' ' +
        message
    );
    if (this.logFile) {
      this.logFile.write(
        new Date().toLocaleString() + ' [INFO] ' + message + '\n'
      );
    }
  };

  public error = (message: string): void => {
    console.log(
      chalk.gray(new Date().toLocaleString()) +
        ' ' +
        chalk.red('[ERROR]') +
        ' ' +
        message
    );
    if (this.logFile) {
      this.logFile.write(
        new Date().toLocaleString() + ' [ERROR] ' + message + '\n'
      );
    }
  };

  public log = (message: string): void => {
    if (this.logFile) {
      this.logFile.write(
        new Date().toLocaleString() + ' [LOG] ' + message + '\n'
      );
    }
  };

  private createLogFile = () => {
    if (!fs.existsSync('./logs')) {
      fs.mkdirSync('./logs');
    }
    return fs.createWriteStream(`./logs/logs_${Date.now()}.log`);
  };

  public catchErrors = (): void => {
    process.on('uncaughtException', (err) => {
      this.error(err.stack);
      return;
    });
  };
}

export default new Logger();
