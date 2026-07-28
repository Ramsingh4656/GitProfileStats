import type { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../../../domain/errors/DomainError.js';

interface IAuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const authGuard = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next(new AuthenticationError('Missing authorization header'));
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    next(new AuthenticationError('Invalid token format'));
    return;
  }

  // Simulated authentication: token value is treated as the user ID for development/skeleton testing
  (req as IAuthenticatedRequest).user = { id: token };
  next();
};
