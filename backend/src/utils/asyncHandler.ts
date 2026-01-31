/**
 * ===========================================
 * Async Handler Utility
 * ===========================================
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Wrap async functions to catch errors
 * Eliminates need for try-catch in route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
