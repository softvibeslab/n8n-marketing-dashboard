/**
 * ===========================================
 * Error Handling Middleware
 * ===========================================
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Error handler middleware
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
      },
    });
    return;
  }

  // Handle application errors
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message =
    statusCode === 500 && config.env === 'production'
      ? 'An unexpected error occurred'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(config.env === 'development' && { stack: err.stack, details: err.details }),
    },
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create an HTTP error
 */
export function createError(
  statusCode: number,
  message: string,
  code?: string,
  details?: unknown
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

import { config } from '../config';

const { env } = config;
