/**
 * ===========================================
 * Logger Utility
 * ===========================================
 */

import winston from 'winston';
import { config } from '../config';

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.printf(({ level, message, timestamp, stack }) => {
        return stack
          ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
          : `${timestamp} [${level.toUpperCase()}]: ${message}`;
      })
);

/**
 * Create logger instance
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      silent: config.env === 'test',
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      silent: config.env === 'test',
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      silent: config.env === 'test',
    }),
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      silent: config.env === 'test',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      silent: config.env === 'test',
    }),
  ],
});

/**
 * Create child logger with context
 */
export function createChildLogger(context: string): winston.Logger {
  return logger.child({ context });
}
