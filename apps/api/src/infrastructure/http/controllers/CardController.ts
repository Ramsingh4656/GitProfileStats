import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  GitHubService,
  StatsService,
  CommitStatsService,
  PullRequestService,
  IssueStatisticsService,
  LanguageCollectorService,
} from '../../../github/index.js';
import type { IGitHubRequest } from '../middleware/validation.js';
import { renderProfileCard, renderStatsCard, renderLanguagesCard } from '../../../cards/index.js';
import { logger } from '../../../config/logger.js';

@injectable()
export class CardController {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
    @inject(StatsService)
    private readonly statsService: StatsService,
    @inject(CommitStatsService)
    private readonly commitStatsService: CommitStatsService,
    @inject(PullRequestService)
    private readonly pullRequestService: PullRequestService,
    @inject(IssueStatisticsService)
    private readonly issueStatisticsService: IssueStatisticsService,
    @inject(LanguageCollectorService)
    private readonly languageCollectorService: LanguageCollectorService,
  ) {}

  /**
   * Generates and returns the user's profile card as an SVG.
   */
  public getProfileCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      throw new Error('GitHub parameters not found');
    }
    const { username, token } = githubParams;
    const theme = req.query.theme as string | undefined;

    logger.info({ username, hasToken: !!token, theme }, 'Received request to render profile card');

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

  /**
   * Generates and returns the user's main GitHub stats card as an SVG.
   */
  public getStatsCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      throw new Error('GitHub parameters not found');
    }
    const { username, token } = githubParams;
    const theme = req.query.theme as string | undefined;

    logger.info({ username, hasToken: !!token, theme }, 'Received request to render stats card');

    void (async () => {
      try {
        // Fetch all required stats in parallel
        const [stats, commitStats, prStats, issueStats] = await Promise.all([
          this.statsService.getStats(username, { token }),
          this.commitStatsService.getCommitStats(username, { token }),
          this.pullRequestService.getPullRequestStats(username, { token }),
          this.issueStatisticsService.getIssueStats(username, { token }),
        ]);

        logger.debug({ username: stats.username }, 'Fetched all user stats for stats card');

        const totalRepositories = stats.publicRepositories + stats.privateRepositories;

        // Render SVG Stats Card
        const svg = renderStatsCard(
          {
            username: stats.username,
            name: stats.name,
            totalStars: stats.totalStars,
            totalCommits: commitStats.totalCommits,
            totalRepositories,
            pullRequests: prStats.totalPullRequests,
            issues: issueStats.totalIssuesOpened,
            followers: stats.followers,
          },
          theme,
        );

        // Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour to mitigate GitHub API rate-limits
        res.status(200).send(svg);
      } catch (error) {
        logger.error({ error, username }, 'Failed to render stats card');
        next(error);
      }
    })();
  };

  /**
   * Generates and returns the user's top languages card as an SVG.
   */
  public getLanguagesCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      throw new Error('GitHub parameters not found');
    }
    const { username, token } = githubParams;
    const theme = req.query.theme as string | undefined;
    const langsCountStr = req.query.langs_count as string | undefined;
    const langsCount = langsCountStr ? parseInt(langsCountStr, 10) : undefined;

    logger.info(
      { username, hasToken: !!token, theme, langsCount },
      'Received request to render languages card',
    );

    void (async () => {
      try {
        // 1. Fetch language statistics
        const languages = await this.languageCollectorService.collectLanguages(username, { token });

        logger.debug(
          { username, languagesCount: languages.length },
          'Fetched language statistics for card',
        );

        // 2. Render SVG Languages Card
        const svg = renderLanguagesCard(languages, theme, { langsCount });

        // 3. Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour to mitigate GitHub API rate-limits
        res.status(200).send(svg);
      } catch (error) {
        logger.error({ error, username }, 'Failed to render languages card');
        next(error);
      }
    })();
  };
}
