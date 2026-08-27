import { injectable, inject } from 'tsyringe';
import { RepositoryStatsService, IRepositoryStats } from './repository-stats.service.js';
import { RepositoryRankingService, IRepositoryRankings } from './repository-ranking.service.js';
import {
  LanguageCollectorService,
  LanguageCollectionResult,
} from './language-collector.service.js';
import { CommitStatsService, ICommitStats } from './commit-stats.service.js';
import { ContributionService, IContributionStats } from './contribution.service.js';
import { PullRequestService, IPullRequestStats } from './pull-request.service.js';
import { IssueStatisticsService, IIssueStats } from './issue-statistics.service.js';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface IGitHubUserProfile {
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  email: string | null;
}

export interface IGitHubCombinedStats {
  userProfile: IGitHubUserProfile;
  repositoryStats: IRepositoryStats;
  repositoryRankings: IRepositoryRankings;
  languageStats: LanguageCollectionResult;
  commitStats: ICommitStats;
  contributionStats: IContributionStats;
  pullRequestStats: IPullRequestStats;
  issueStats: IIssueStats;
}

@injectable()
export class GitHubStatisticsService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
    @inject(RepositoryStatsService)
    private readonly repositoryStatsService: RepositoryStatsService,
    @inject(RepositoryRankingService)
    private readonly repositoryRankingService: RepositoryRankingService,
    @inject(LanguageCollectorService)
    private readonly languageCollectorService: LanguageCollectorService,
    @inject(CommitStatsService)
    private readonly commitStatsService: CommitStatsService,
    @inject(ContributionService)
    private readonly contributionService: ContributionService,
    @inject(PullRequestService)
    private readonly pullRequestService: PullRequestService,
    @inject(IssueStatisticsService)
    private readonly issueStatisticsService: IssueStatisticsService,
  ) {}

  /**
   * Combines all GitHub statistics for a user into one unified response.
   */
  public async getCombinedStatistics(
    username?: string,
    options?: { token?: string },
  ): Promise<IGitHubCombinedStats> {
    logger.info({ username, hasToken: !!options?.token }, 'Fetching combined GitHub statistics');

    const [
      user,
      repositoryStats,
      repositoryRankings,
      languageStats,
      commitStats,
      contributionStats,
      pullRequestStats,
      issueStats,
    ] = await Promise.all([
      username
        ? this.gitHubService.getUser(username, options?.token)
        : this.gitHubService.getAuthenticatedUser(options?.token),
      this.repositoryStatsService.getRepositoryStats(username, options),
      this.repositoryRankingService.getRepositoryRankings(username, options),
      this.languageCollectorService.collectLanguages(username, options),
      this.commitStatsService.getCommitStats(username, options),
      this.contributionService.getContributionStats(username, options),
      this.pullRequestService.getPullRequestStats(username, options),
      this.issueStatisticsService.getIssueStats(username, options),
    ]);

    const combinedStats: IGitHubCombinedStats = {
      userProfile: {
        bio: user.bio,
        location: user.location,
        company: user.company,
        blog: user.blog,
        email: user.email,
      },
      repositoryStats,
      repositoryRankings,
      languageStats,
      commitStats,
      contributionStats,
      pullRequestStats,
      issueStats,
    };

    logger.info({ username }, 'Successfully combined all GitHub statistics');
    return combinedStats;
  }
}
