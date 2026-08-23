import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../../../domain/errors/DomainError.js';

const githubQuerySchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, 'Username cannot be empty')
      .max(100, 'Username is too long')
      .optional(),
  })
  .refine((data) => data.username, {
    message: 'A username must be provided',
    path: ['username'],
  });

export interface IGitHubRequest extends Request {
  githubAccessToken?: string;
  githubParams?: {
    username?: string;
    githubAccessToken?: string;
  };
}

export const validateGitHubRequest = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.query.token !== undefined || req.headers['x-github-token'] !== undefined) {
    next(new AuthenticationError('GitHub tokens must be configured through the authenticated session'));
    return;
  }

  const username = req.query.username as string | undefined;
  const result = githubQuerySchema.safeParse({ username });

  if (!result.success) {
    next(result.error);
    return;
  }

  const githubAccessToken = (req as IGitHubRequest).githubAccessToken;
  (req as IGitHubRequest).githubParams = { ...result.data, githubAccessToken };
  next();
};

const repositoryQuerySchema = z.object({
  owner: z
    .string()
    .trim()
    .min(1, 'Owner name cannot be empty')
    .max(100, 'Owner name is too long'),
  repo: z
    .string()
    .trim()
    .min(1, 'Repository name cannot be empty')
    .max(100, 'Repository name is too long'),
});

export interface IRepositoryRequest extends Request {
  githubAccessToken?: string;
  repoParams?: {
    owner: string;
    repo: string;
    githubAccessToken?: string;
  };
}

export const validateRepositoryRequest = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.query.token !== undefined || req.headers['x-github-token'] !== undefined) {
    next(new AuthenticationError('GitHub tokens must be configured through the authenticated session'));
    return;
  }

  const owner = (req.query.owner || req.query.username) as string | undefined;
  const repo = req.query.repo as string | undefined;
  const result = repositoryQuerySchema.safeParse({ owner, repo });

  if (!result.success) {
    next(result.error);
    return;
  }

  const githubAccessToken = (req as IRepositoryRequest).githubAccessToken;
  (req as IRepositoryRequest).repoParams = { ...result.data, githubAccessToken };
  next();
};
