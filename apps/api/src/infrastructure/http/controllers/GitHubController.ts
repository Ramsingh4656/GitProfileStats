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
} from '../../../github/index.js';
import type { IGitHubRequest } from '../middleware/validation.js';

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
  ) {}

  public getStats = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = (req as IGitHubRequest).githubParams!;
    this.statsService
      .getStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getRepositories = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = (req as IGitHubRequest).githubParams!;
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
    const { username, token } = (req as IGitHubRequest).githubParams!;
    this.languageCollectorService
      .collectLanguages(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getContributions = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = (req as IGitHubRequest).githubParams!;
    this.contributionService
      .getContributionStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getCommits = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = (req as IGitHubRequest).githubParams!;
    this.commitStatsService
      .getCommitStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getPullRequests = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = (req as IGitHubRequest).githubParams!;
    this.pullRequestService
      .getPullRequestStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };

  public getIssues = (req: Request, res: Response, next: NextFunction): void => {
    const { username, token } = (req as IGitHubRequest).githubParams!;
    this.issueStatisticsService
      .getIssueStats(username, { token })
      .then((data) => {
        res.status(200).json({ success: true, data });
      })
      .catch(next);
  };
}
