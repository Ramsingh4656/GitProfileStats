import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { env } from '../../../config/env.js';
import { logger } from '../../../config/logger.js';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';
import { User } from '../../../domain/entities/User.js';
import { GitHubService } from '../../../github/github.service.js';

@injectable()
export class AuthController {
  constructor(
    @inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  public loginWithGithub = (req: Request, res: Response): void => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GITHUB_CALLBACK_URL)}&scope=read:user,repo`;
    res.redirect(githubAuthUrl);
  };

  public handleGithubCallback = (req: Request, res: Response, _next: NextFunction): void => {
    const code = req.query.code as string;
    if (!code) {
      res.redirect(`${env.WEB_BASE_URL}/login/callback?error=missing_code`);
      return;
    }

    void (async () => {
      try {
        logger.info('Exchanging OAuth code for token');
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: env.GITHUB_CALLBACK_URL,
          }),
        });

        if (!tokenResponse.ok) {
          const errText = await tokenResponse.text();
          throw new Error(`Failed to exchange code: ${tokenResponse.statusText} - ${errText}`);
        }

        const tokenData = (await tokenResponse.json()) as {
          access_token?: string;
          error?: string;
          error_description?: string;
        };

        if (tokenData.error) {
          throw new Error(tokenData.error_description ?? tokenData.error);
        }

        const accessToken = tokenData.access_token;
        if (!accessToken) {
          throw new Error('Access token not found in response');
        }

        logger.info('Fetching GitHub user profile with access token');
        const githubUser = await this.gitHubService.getAuthenticatedUser(accessToken);

        // Find or create user
        let user = await this.userRepository.findByUsername(githubUser.login);
        if (!user) {
          user = User.create({
            id: githubUser.id.toString(),
            githubId: githubUser.id.toString(),
            username: githubUser.login,
            email: githubUser.email ?? null,
            avatarUrl: githubUser.avatar_url,
            tier: 'FREE',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          await this.userRepository.save(user);
          logger.info({ username: user.username }, 'Created new user');
        } else {
          logger.info({ username: user.username }, 'Existing user logged in');
        }

        // Redirect back to frontend callback page with the session token (user.id)
        res.redirect(`${env.WEB_BASE_URL}/login/callback?token=${user.id}`);
      } catch (error: unknown) {
        logger.error({ error }, 'GitHub OAuth callback error');
        const errMsg = error instanceof Error ? error.message : 'auth_failed';
        res.redirect(
          `${env.WEB_BASE_URL}/login/callback?error=${encodeURIComponent(errMsg)}`,
        );
      }
    })();
  };
}
