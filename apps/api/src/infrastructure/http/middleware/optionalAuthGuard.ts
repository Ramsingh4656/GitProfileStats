import type { Request, Response, NextFunction } from 'express';
import { container } from '../../../config/container.js';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';
import { AuthenticationError } from '../../../domain/errors/DomainError.js';
import { SESSION_COOKIE_NAME } from '../../../application/services/SessionService.js';
import { authGuard, type IAuthenticatedRequest } from './authGuard.js';
import type { IGitHubRequest } from './validation.js';

const userRepository = container.resolve<IUserRepository>('IUserRepository');

export const optionalAuthGuard = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.cookies?.[SESSION_COOKIE_NAME]) {
    next();
    return;
  }

  authGuard(req, res, (error?: unknown) => {
    if (error) {
      next(error);
      return;
    }

    const userId = (req as IAuthenticatedRequest).user?.id;
    if (!userId) {
      next(new AuthenticationError('Invalid session'));
      return;
    }

    void userRepository
      .findById(userId)
      .then((user) => {
        if (!user) {
          throw new AuthenticationError('Invalid session');
        }
        (req as IGitHubRequest).githubAccessToken = user.githubAccessToken;
        next();
      })
      .catch(next);
  });
};
