import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/DomainError.js';
import { logger } from '../../../config/logger.js';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof DomainError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  logger.error(error, `Unhandled exception on ${req.method} ${req.url}`);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
