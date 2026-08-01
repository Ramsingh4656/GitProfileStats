import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  StatsService,
  RepositoryStatsService,
  RepositoryRankingService,
  LanguageCollectorService,
  ContributionService,
  CommitStatsService,
  PullRequestService,
  IssueStatisticsService,
  GitHubStatisticsService,
} from '../../../github/index.js';
import type { IGitHubRequest } from '../middleware/validation.js';

function getParams(req: Request): { username?: string; token?: string } {
  const params = (req as IGitHubRequest).githubParams;
  if (params) return params;
  const username = req.query.username as string | undefined;
  const token = (req.query.token || req.headers['x-github-token']) as string | undefined;
  return { username, token };
}

@injectable()
export class GitHubController {
  constructor(
    @inject(StatsService)
    private readonly statsService: StatsService,
    @inject(RepositoryStatsService)
    private readonly repositoryStatsService: RepositoryStatsService,
    @inject(RepositoryRankingService)
    private readonly repositoryRankingService: RepositoryRankingService,
    @inject(LanguageCollectorService)
    private readonly languageCollectorService: LanguageCollectorService,
    @inject(ContributionService)
    private readonly contributionService: ContributionService,
    @inject(CommitStatsService)
    private readonly commitStatsService: CommitStatsService,
    @inject(PullRequestService)
    private readonly pullRequestService: PullRequestService,
    @inject(IssueStatisticsService)
    private readonly issueStatisticsService: IssueStatisticsService,
    @inject(GitHubStatisticsService)
    private readonly githubStatisticsService: GitHubStatisticsService,
  ) {}

  public getStats = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = getParams(req);
    if (!username) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    this.statsService
      .getStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getRepositories = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = getParams(req);
    if (!username) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    Promise.all([
      this.repositoryStatsService.getRepositoryStats(username, { token }),
      this.repositoryRankingService.getRepositoryRankings(username, { token }),
    ])
      .then(([stats, rankings]) => {
        res.status(200).json({
          success: true,
          data: {
            stats,
            rankings,
          },
        });
      })
      .catch(next);
  };

  public getLanguages = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = getParams(req);
    if (!username) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    this.languageCollectorService
      .collectLanguages(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getContributions = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = getParams(req);
    if (!username) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    this.contributionService
      .getContributionStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getCommits = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = getParams(req);
    if (!username) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    this.commitStatsService
      .getCommitStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getPullRequests = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = getParams(req);
    if (!username) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    this.pullRequestService
      .getPullRequestStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getIssues = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = getParams(req);
    if (!username) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    this.issueStatisticsService
      .getIssueStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getCombinedStatistics = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = getParams(req);
    if (!username) {
      next(new Error('GitHub parameters not found'));
      return;
    }
    this.githubStatisticsService
      .getCombinedStatistics(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };
}
