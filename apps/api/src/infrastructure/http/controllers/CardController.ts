/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/prefer-nullish-coalescing */
import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  GitHubService,
  StatsService,
  CommitStatsService,
  PullRequestService,
  IssueStatisticsService,
  LanguageCollectorService,
  ContributionService,
  ContributedReposService,
  RepositoryRankingService,
} from '../../../github/index.js';
import type { IGitHubRequest, IRepositoryRequest } from '../middleware/validation.js';
import {
  renderProfileCard,
  renderStatsCard,
  renderLanguagesCard,
  renderStreakCard,
  renderRepositoryCard,
  renderTrophiesCard,
  renderTopContributedCard,
  renderRankingsCard,
  type CardOptions,
} from '../../../cards/index.js';
import { logger } from '../../../config/logger.js';
import { env } from '../../../config/env.js';

// Mock datasets for offline preview / fallback
const MOCK_USER = (username: string): any => ({
  login: username || 'octocat',
  id: 5832347,
  node_id: 'MDQ6VXNlcjU4MzIzNDc=',
  avatar_url: 'https://avatars.githubusercontent.com/u/5832347?v=4',
  gravatar_id: null,
  url: 'https://api.github.com/users/octocat',
  html_url: 'https://github.com/octocat',
  followers_url: 'https://api.github.com/users/octocat/followers',
  following_url: 'https://api.github.com/users/octocat/following',
  gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
  organizations_url: 'https://api.github.com/users/octocat/orgs',
  repos_url: 'https://api.github.com/users/octocat/repos',
  events_url: 'https://api.github.com/users/octocat/events{/privacy}',
  received_events_url: 'https://api.github.com/users/octocat/received_events',
  type: 'User',
  site_admin: false,
  name: 'The Octocat',
  company: 'GitHub',
  blog: 'https://github.blog',
  location: 'San Francisco',
  email: null,
  hireable: null,
  bio: 'Testing out the GitHub API.',
  public_repos: 42,
  public_gists: 8,
  followers: 1337,
  following: 50,
  created_at: '2011-01-25T18:44:36Z',
  updated_at: '2026-07-30T10:00:00Z',
});

const MOCK_STATS = (username: string) => ({
  username: username || 'octocat',
  name: 'The Octocat',
  totalStars: 142,
  totalCommits: 2854,
  totalRepositories: 42,
  pullRequests: 89,
  issues: 24,
  followers: 1337,
});

const MOCK_LANGUAGES = [
  { language: 'TypeScript', bytes: 145000, percentage: 55.4, repositoryCount: 12 },
  { language: 'JavaScript', bytes: 68000, percentage: 26.0, repositoryCount: 8 },
  { language: 'HTML', bytes: 24000, percentage: 9.2, repositoryCount: 6 },
  { language: 'CSS', bytes: 16000, percentage: 6.1, repositoryCount: 4 },
  { language: 'Python', bytes: 8600, percentage: 3.3, repositoryCount: 2 },
];

const MOCK_STREAK = (username: string) => ({
  username: username || 'octocat',
  totalContributions: 1842,
  currentStreak: 15,
  longestStreak: 42,
  contributionCalendar: {
    totalContributions: 1842,
    weeks: [],
  },
});

const MOCK_REPOSITORY = (owner: string, repo: string): any => ({
  name: repo || 'GitProfileStats',
  owner: {
    login: owner || 'Ramsingh4656',
  },
  description:
    'A beautiful dashboard and profile card generator for your GitHub stats. Support custom themes, language cards, streak tracking, and more.',
  language: 'TypeScript',
  stargazers_count: 142,
  forks_count: 28,
  license: {
    name: 'MIT License',
    spdx_id: 'MIT',
  },
  updated_at: '2026-08-01T08:00:00Z',
});

const MOCK_CONTRIBUTIONS = [
  { name: 'GitProfileStats', owner: 'Ramsingh4656', primaryLanguage: { name: 'TypeScript', color: '#3178c6' }, contributionCount: 142 },
  { name: 'typescript', owner: 'microsoft', primaryLanguage: { name: 'TypeScript', color: '#3178c6' }, contributionCount: 88 },
  { name: 'vscode', owner: 'microsoft', primaryLanguage: { name: 'TypeScript', color: '#3178c6' }, contributionCount: 54 },
  { name: 'next.js', owner: 'vercel', primaryLanguage: { name: 'JavaScript', color: '#f1e05a' }, contributionCount: 32 },
  { name: 'react', owner: 'facebook', primaryLanguage: { name: 'JavaScript', color: '#f1e05a' }, contributionCount: 19 },
];

const MOCK_RANKINGS = (username: string) => ({
  username: username || 'octocat',
  name: 'The Octocat',
  mostStarred: {
    id: 1,
    name: 'Hello-World',
    fullName: 'octocat/Hello-World',
    htmlUrl: 'https://github.com/octocat/Hello-World',
    description: 'My first repository on GitHub!',
    stars: 142,
    forks: 28,
    size: 120,
    createdAt: '2011-01-25T18:44:36Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  mostForked: {
    id: 2,
    name: 'Spoon-Knife',
    fullName: 'octocat/Spoon-Knife',
    htmlUrl: 'https://github.com/octocat/Spoon-Knife',
    description: 'This repo is for spooning-and-knifing.',
    stars: 89,
    forks: 142,
    size: 80,
    createdAt: '2011-01-27T19:30:00Z',
    updatedAt: '2026-08-02T09:00:00Z',
  },
  mostRecentlyUpdated: {
    id: 3,
    name: 'octocat.github.io',
    fullName: 'octocat/octocat.github.io',
    htmlUrl: 'https://github.com/octocat/octocat.github.io',
    description: 'My personal website homepage.',
    stars: 42,
    forks: 12,
    size: 200,
    createdAt: '2011-02-01T20:00:00Z',
    updatedAt: '2026-08-28T01:00:00Z',
  },
});

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
    @inject(ContributionService)
    private readonly contributionService: ContributionService,
    @inject(ContributedReposService)
    private readonly contributedReposService: ContributedReposService,
    @inject(RepositoryRankingService)
    private readonly repositoryRankingService: RepositoryRankingService,
  ) {}

  /**
   * Helper to check if mock data should be used.
   */
  private shouldMock(username?: string, token?: string, forceMock?: boolean): boolean {
    if (forceMock) return true;
    if (username === 'demo' || username === 'mock') return true;
    const defaultToken = env.GITHUB_TOKEN;
    if (!token && (defaultToken === 'dummy_token' || !defaultToken)) {
      return true;
    }
    return false;
  }

  /**
   * Helper to parse customization options from request query.
   */
  private getCardOptions(req: Request): CardOptions {
    const theme = req.query.theme as string | undefined;
    const accent = req.query.accent as string | undefined;
    const background = req.query.background as string | undefined;
    const borderRadiusStr = req.query.border_radius as string | undefined;
    const hideBorder = req.query.hide_border === 'true';
    const fontFamily = req.query.font_family as string | undefined;
    const fontStyle = req.query.font_style as string | undefined;

    const borderRadius = borderRadiusStr ? parseInt(borderRadiusStr, 10) : undefined;

    return {
      theme,
      accent,
      background,
      borderRadius,
      hideBorder,
      fontFamily,
      fontStyle,
    };
  }

  /**
   * Generates and returns the user's profile card as an SVG.
   */
  public getProfileCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    const { username, githubAccessToken: token } = githubParams;
    const options = this.getCardOptions(req);

    logger.info(
      { username, hasToken: !!token, options },
      'Received request to render profile card',
    );

    void (async () => {
      try {
        const forceMock = req.query.mock === 'true';
        if (this.shouldMock(username, token, forceMock)) {
          const mockUser = MOCK_USER(username || 'octocat');
          const mockStats = { publicRepositories: 42, privateRepositories: 18 };
          const svg = await renderProfileCard(mockUser, mockStats, options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
          return;
        }

        // 1. Fetch GitHub user profile
        const user = username
          ? await this.gitHubService.getUser(username, token)
          : await this.gitHubService.getAuthenticatedUser(token);

        logger.debug({ username: user.login }, 'Fetched GitHub user profile for card');

        // Fetch stats to get public and private repository counts
        let stats = null;
        try {
          stats = await this.statsService.getStats(username, { token });
        } catch (err) {
          logger.warn(
            { username, err },
            'Failed to fetch user stats for profile card, private repo count will fallback to 0',
          );
        }

        // 2. Render SVG Profile Card
        const svg = await renderProfileCard(user, stats, options);

        // 3. Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes to mitigate GitHub API rate-limits
        res.status(200).send(svg);
      } catch {
        logger.warn({ username }, 'Failed to render profile card, falling back to mock data');
        try {
          const mockUser = MOCK_USER(username || 'octocat');
          const mockStats = { publicRepositories: 42, privateRepositories: 18 };
          const svg = await renderProfileCard(mockUser, mockStats, options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
        } catch (fallbackError) {
          next(fallbackError);
        }
      }
    })();
  };

  /**
   * Generates and returns the user's main GitHub stats card as an SVG.
   */
  public getStatsCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    const { username, githubAccessToken: token } = githubParams;
    const options = this.getCardOptions(req);

    logger.info({ username, hasToken: !!token, options }, 'Received request to render stats card');

    void (async () => {
      try {
        const forceMock = req.query.mock === 'true';
        if (this.shouldMock(username, token, forceMock)) {
          const svg = renderStatsCard(MOCK_STATS(username || 'octocat'), options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
          return;
        }

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
          options,
        );

        // Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes to mitigate GitHub API rate-limits
        res.status(200).send(svg);
      } catch {
        logger.warn({ username }, 'Failed to render stats card, falling back to mock data');
        try {
          const svg = renderStatsCard(MOCK_STATS(username || 'octocat'), options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
        } catch (fallbackError) {
          next(fallbackError);
        }
      }
    })();
  };

  /**
   * Generates and returns the user's trophies card as an SVG.
   */
  public getTrophiesCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    const { username, githubAccessToken: token } = githubParams;
    const options = this.getCardOptions(req);

    logger.info({ username, hasToken: !!token, options }, 'Received request to render trophies card');

    void (async () => {
      try {
        const forceMock = req.query.mock === 'true';
        if (this.shouldMock(username, token, forceMock)) {
          const svg = renderTrophiesCard(MOCK_STATS(username || 'octocat'), options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
          return;
        }

        // Fetch all required stats in parallel
        const [stats, commitStats, prStats, issueStats] = await Promise.all([
          this.statsService.getStats(username, { token }),
          this.commitStatsService.getCommitStats(username, { token }),
          this.pullRequestService.getPullRequestStats(username, { token }),
          this.issueStatisticsService.getIssueStats(username, { token }),
        ]);

        logger.debug({ username: stats.username }, 'Fetched all user stats for trophies card');

        const totalRepositories = stats.publicRepositories + stats.privateRepositories;

        // Render SVG Trophies Card
        const svg = renderTrophiesCard(
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
          options,
        );

        // Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        res.status(200).send(svg);
      } catch {
        logger.warn({ username }, 'Failed to render trophies card, falling back to mock data');
        try {
          const svg = renderTrophiesCard(MOCK_STATS(username || 'octocat'), options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
        } catch (fallbackError) {
          next(fallbackError);
        }
      }
    })();
  };

  /**
   * Generates and returns the user's top contributed repositories card as an SVG.
   */
  public getTopContributedCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    const { username, githubAccessToken: token } = githubParams;
    const options = this.getCardOptions(req);
    const limitStr = req.query.limit as string | undefined;
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    logger.info(
      { username, hasToken: !!token, options, limit },
      'Received request to render top contributed repos card',
    );

    void (async () => {
      try {
        const forceMock = req.query.mock === 'true';
        if (this.shouldMock(username, token, forceMock)) {
          const svg = renderTopContributedCard(MOCK_CONTRIBUTIONS, { ...options, limit });
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
          return;
        }

        // Fetch top contributed repos
        const repos = await this.contributedReposService.getTopContributedRepos(username, { token });

        logger.debug(
          { username, reposCount: repos.length },
          'Fetched top contributed repositories for card',
        );

        // Render SVG Top Contributed Card
        const svg = renderTopContributedCard(repos, { ...options, limit });

        // Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        res.status(200).send(svg);
      } catch {
        logger.warn({ username }, 'Failed to render top contributed repos card, falling back to mock data');
        try {
          const svg = renderTopContributedCard(MOCK_CONTRIBUTIONS, { ...options, limit });
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
        } catch (fallbackError) {
          next(fallbackError);
        }
      }
    })();
  };

  /**
   * Generates and returns the user's repository rankings card as an SVG.
   */
  public getRankingsCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    const { username, githubAccessToken: token } = githubParams;
    const options = this.getCardOptions(req);

    logger.info({ username, hasToken: !!token, options }, 'Received request to render rankings card');

    void (async () => {
      try {
        const forceMock = req.query.mock === 'true';
        if (this.shouldMock(username, token, forceMock)) {
          const svg = renderRankingsCard(MOCK_RANKINGS(username || 'octocat'), options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
          return;
        }

        // Fetch user and rankings in parallel
        const [user, rankings] = await Promise.all([
          username
            ? this.gitHubService.getUser(username, token)
            : this.gitHubService.getAuthenticatedUser(token),
          this.repositoryRankingService.getRepositoryRankings(username, { token }),
        ]);

        logger.debug({ username: user.login }, 'Fetched user profile and rankings for card');

        // Render SVG Rankings Card
        const svg = renderRankingsCard(
          {
            username: user.login,
            name: user.name,
            mostStarred: rankings.mostStarred,
            mostForked: rankings.mostForked,
            mostRecentlyUpdated: rankings.mostRecentlyUpdated,
          },
          options,
        );

        // Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        res.status(200).send(svg);
      } catch {
        logger.warn({ username }, 'Failed to render rankings card, falling back to mock data');
        try {
          const svg = renderRankingsCard(MOCK_RANKINGS(username || 'octocat'), options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
        } catch (fallbackError) {
          next(fallbackError);
        }
      }
    })();
  };

  /**
   * Generates and returns the user's top languages card as an SVG.
   */
  public getLanguagesCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    const { username, githubAccessToken: token } = githubParams;
    const options = this.getCardOptions(req);
    const langsCountStr = req.query.langs_count as string | undefined;
    const langsCount = langsCountStr ? parseInt(langsCountStr, 10) : undefined;

    logger.info(
      { username, hasToken: !!token, options, langsCount },
      'Received request to render languages card',
    );

    void (async () => {
      try {
        const forceMock = req.query.mock === 'true';
        if (this.shouldMock(username, token, forceMock)) {
          const svg = renderLanguagesCard(MOCK_LANGUAGES, { ...options, langsCount });
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
          return;
        }

        // 1. Fetch language statistics
        const languages = await this.languageCollectorService.collectLanguages(username, { token });

        logger.debug(
          { username, languagesCount: languages.length },
          'Fetched language statistics for card',
        );

        // 2. Render SVG Languages Card
        const svg = renderLanguagesCard(languages, { ...options, langsCount });

        // 3. Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes to mitigate GitHub API rate-limits
        res.status(200).send(svg);
      } catch {
        logger.warn({ username }, 'Failed to render languages card, falling back to mock data');
        try {
          const svg = renderLanguagesCard(MOCK_LANGUAGES, { ...options, langsCount });
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
        } catch (fallbackError) {
          next(fallbackError);
        }
      }
    })();
  };

  /**
   * Generates and returns the user's streak stats card as an SVG.
   */
  public getStreakCard = (req: Request, res: Response, next: NextFunction): void => {
    const githubParams = (req as IGitHubRequest).githubParams;
    if (!githubParams) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    const { username, githubAccessToken: token } = githubParams;
    const options = this.getCardOptions(req);

    logger.info({ username, hasToken: !!token, options }, 'Received request to render streak card');

    void (async () => {
      try {
        const forceMock = req.query.mock === 'true';
        if (this.shouldMock(username, token, forceMock)) {
          const svg = renderStreakCard(MOCK_STREAK(username || 'octocat'), options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
          return;
        }

        // 1. Fetch contribution and streak statistics
        const stats = await this.contributionService.getContributionStats(username, { token });

        logger.debug({ username: stats.username }, 'Fetched contribution stats for streak card');

        // 2. Render SVG Streak Card
        const svg = renderStreakCard(stats, options);

        // 3. Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        res.status(200).send(svg);
      } catch {
        logger.warn({ username }, 'Failed to render streak card, falling back to mock data');
        try {
          const svg = renderStreakCard(MOCK_STREAK(username || 'octocat'), options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
        } catch (fallbackError) {
          next(fallbackError);
        }
      }
    })();
  };

  /**
   * Generates and returns the repository card as an SVG.
   */
  public getRepositoryCard = (req: Request, res: Response, next: NextFunction): void => {
    const repoParams = (req as IRepositoryRequest).repoParams;
    if (!repoParams) {
      next(new Error('Repository parameters not found'));
      return;
    }
    const { owner, repo, githubAccessToken: token } = repoParams;
    const options = this.getCardOptions(req);

    logger.info(
      { owner, repo, hasToken: !!token, options },
      'Received request to render repository card',
    );

    void (async () => {
      try {
        const forceMock = req.query.mock === 'true';
        if (this.shouldMock(owner, token, forceMock)) {
          const mockRepo = MOCK_REPOSITORY(owner || 'Ramsingh4656', repo || 'GitProfileStats');
          const svg = renderRepositoryCard(mockRepo, options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
          return;
        }

        // Fetch repository details
        const repoData = await this.gitHubService.getRepository(owner, repo, token);

        logger.debug({ owner, repo: repoData.name }, 'Fetched repository details for card');

        // Render SVG Repository Card
        const svg = renderRepositoryCard(repoData, options);

        // Return response with SVG headers and caching
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        res.status(200).send(svg);
      } catch {
        logger.warn({ owner, repo }, 'Failed to render repository card, falling back to mock data');
        try {
          const mockRepo = MOCK_REPOSITORY(owner || 'Ramsingh4656', repo || 'GitProfileStats');
          const svg = renderRepositoryCard(mockRepo, options);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.status(200).send(svg);
        } catch (fallbackError) {
          next(fallbackError);
        }
      }
    })();
  };
}
