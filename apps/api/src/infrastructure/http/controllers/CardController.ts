import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GitHubService } from '../../../github/index.js';
import type { IGitHubRequest } from '../middleware/validation.js';
import { renderProfileCard } from '../../../cards/index.js';
import { logger } from '../../../config/logger.js';

@injectable()
export class CardController {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Generates and returns the user's profile card as an SVG.
   */
  public getProfileCard = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = (req as IGitHubRequest).githubParams!;
    const theme = req.query.theme as string | undefined;

    logger.info(
      { username, hasToken: !!token, theme },
      'Received request to render profile card',
    );

    void (async () => {
      try {
        // 1. Fetch GitHub user profile
        const user = username
          ? await this.gitHubService.getUser(username, token)
          : await this.gitHubService.getAuthenticatedUser(token);

        logger.debug({ username: user.login }, 'Fetched GitHub user profile for card');

        // 2. Render SVG Profile Card
        const svg = await renderProfileCard(user, theme);

        // 3. Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour to mitigate GitHub API rate-limits
        res.status(200).send(svg);
      } catch (error) {
        logger.error({ error, username }, 'Failed to render profile card');
        next(error);
      }
    })();
  };
}
