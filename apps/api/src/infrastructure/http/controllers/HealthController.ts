import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { GitHubService } from '../../../github/github.service.js';
import { env } from '../../../config/env.js';

@injectable()
export class HealthController {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  public check = (_req: Request, res: Response): void => {
    void (async () => {
      let githubStatus = 'healthy';
      let githubMessage = 'Reachable';

      if (env.NODE_ENV === 'test') {
        githubStatus = 'healthy';
        githubMessage = 'Bypassed in test environment';
      } else {
        try {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('GitHub API timeout')), 3000)
          );

          await Promise.race([
            this.gitHubService.getAuthenticatedUser(),
            timeout,
          ]);
        } catch (error: any) {
          githubStatus = 'degraded';
          githubMessage = error instanceof Error ? error.message : String(error);
        }
      }

      const totalMemory = process.memoryUsage();
      const isSystemOk = githubStatus === 'healthy';

      res.status(200).json({
        status: isSystemOk ? 'ok' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        services: {
          githubApi: {
            status: githubStatus,
            message: githubMessage,
          },
        },
        system: {
          memoryUsage: {
            rss: `${(totalMemory.rss / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(totalMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(totalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          },
          nodeVersion: process.version,
        },
      });
    })();
  };
}
