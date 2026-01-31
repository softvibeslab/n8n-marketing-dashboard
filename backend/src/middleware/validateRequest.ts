/**
 * ===========================================
 * Request Validation Middleware
 * ===========================================
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Validate request using Zod schemas
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: Record<string, unknown> = {};

    // Validate body
    if (schemas.body) {
      try {
        req.body = schemas.body.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          validationErrors.body = error.errors;
        }
      }
    }

    // Validate query
    if (schemas.query) {
      try {
        req.query = schemas.query.parse(req.query);
      } catch (error) {
        if (error instanceof ZodError) {
          validationErrors.query = error.errors;
        }
      }
    }

    // Validate params
    if (schemas.params) {
      try {
        req.params = schemas.params.parse(req.params);
      } catch (error) {
        if (error instanceof ZodError) {
          validationErrors.params = error.errors;
        }
      }
    }

    // If there are validation errors, return 400
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: validationErrors,
        },
      });
    }

    next();
  });
};
