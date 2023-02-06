import chalk from 'chalk';
import { ForegroundColor } from 'chalk';
import fs from 'fs';

interface LoggerOptions {
  debug?: boolean;
  fileOnly?: boolean;
}

export class Logger {
  constructor() {
    this.debugMode = process.env.DEBUGMODE === 'true';
    this.logFile =
      process.env.SAVELOGS === 'true' ? this.createLogFile() : null;
  }

  public debugMode: boolean;
  public readonly logFile: fs.WriteStream;

  private loggerFactory = (
    level: string,
    color: typeof ForegroundColor,
    options?: LoggerOptions
  ) => {
    if (options?.debug && !this.debugMode) return () => {};
    return (message: string): void => {
      if (!options?.fileOnly) {
        console.log(
          chalk.gray(new Date().toLocaleString()) +
            ' ' +
            chalk[color](`[${level}]`) +
            ' ' +
            message
        );
      }
      if (this.logFile) {
        this.logFile.write(
          new Date().toLocaleString() + ` [${level}] ` + message + '\n'
        );
      }
    };
  };

  public debug = this.loggerFactory('DEBUG', 'blue', { debug: true });
  public info = this.loggerFactory('INFO', 'green');
  public error = this.loggerFactory('ERROR', 'red');
  public log = this.loggerFactory('LOG', 'white', { fileOnly: true });

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
