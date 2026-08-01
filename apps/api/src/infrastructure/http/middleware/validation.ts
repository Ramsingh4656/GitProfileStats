import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

const githubQuerySchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, 'Username cannot be empty')
      .max(100, 'Username is too long')
      .optional(),
    token: z.string().trim().min(1, 'Token cannot be empty').optional(),
  })
  .refine((data) => data.username || data.token, {
    message:
      'Either username or a GitHub token (via query parameter or x-github-token header) must be provided',
    path: ['username'],
  });

export interface IGitHubRequest extends Request {
  githubParams?: {
    username?: string;
    token?: string;
  };
}

/**
 * Middleware to validate that the request has either a username or a token.
 * Token can be supplied as a query parameter or via the x-github-token header.
 */
export const validateGitHubRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const queryToken = req.query.token as string | undefined;
  const headerToken = req.headers['x-github-token'] as string | undefined;
  const token = queryToken || headerToken || undefined;
  const username = req.query.username as string | undefined;

  const result = githubQuerySchema.safeParse({ username, token });

  if (!result.success) {
    next(result.error);
    return;
  }

  // Attach sanitized data to request
  (req as IGitHubRequest).githubParams = result.data;
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
  token: z.string().trim().min(1, 'Token cannot be empty').optional(),
});

export interface IRepositoryRequest extends Request {
  repoParams?: {
    owner: string;
    repo: string;
    token?: string;
  };
}

export const validateRepositoryRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const queryToken = req.query.token as string | undefined;
  const headerToken = req.headers['x-github-token'] as string | undefined;
  const token = queryToken || headerToken || undefined;
  const owner = (req.query.owner || req.query.username) as string | undefined;
  const repo = req.query.repo as string | undefined;

  const result = repositoryQuerySchema.safeParse({ owner, repo, token });

  if (!result.success) {
    next(result.error);
    return;
  }

  // Attach sanitized data to request
  (req as IRepositoryRequest).repoParams = result.data;
  next();
};
