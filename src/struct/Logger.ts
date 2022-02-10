import { createLogger, format, transports } from 'winston';

const WinstonLogger = createLogger({
  transports: [new transports.Console()],
  exitOnError: false,
  format: format.printf((info) => {
    const { level, message } = info;
    const now = new Date().toLocaleString();
    return `[${now}] | [${level.toUpperCase()}] ${message}`;
  })
});

export default WinstonLogger;
