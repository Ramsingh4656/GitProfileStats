import { injectable, inject } from 'tsyringe';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface IRepositoryStats {
  total: number;
  public: number;
  private: number;
  forks: number;
  original: number;
  archived: number;
  disabled: number;
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  openIssuesCount: number;
}

@injectable()
export class RepositoryStatsService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Calculates repository statistics for a user.
   */
  public async getRepositoryStats(
    username?: string,
    options?: { token?: string },
  ): Promise<IRepositoryStats> {
    logger.info({ username, hasToken: !!options?.token }, 'Calculating repository stats');

    // Fetch all repositories
    const repos = await this.gitHubService.getAllRepositories(username, options);
    logger.debug({ count: repos.length }, 'Fetched repositories for stats calculation');

    // Aggregate statistics
    let publicCount = 0;
    let privateCount = 0;
    let forksCount = 0;
    let originalCount = 0;
    let archivedCount = 0;
    let disabledCount = 0;
    let totalStars = 0;
    let totalForks = 0;
    let totalWatchers = 0;
    let openIssuesCount = 0;

    for (const repo of repos) {
      if (repo.private) {
        privateCount++;
      } else {
        publicCount++;
      }

      if (repo.fork) {
        forksCount++;
      } else {
        originalCount++;
      }

      if (repo.archived) {
        archivedCount++;
      }

      if (repo.disabled) {
        disabledCount++;
      }

      totalStars += repo.stargazers_count ?? 0;
      totalForks += repo.forks_count ?? 0;
      totalWatchers += repo.watchers_count ?? 0;
      openIssuesCount += repo.open_issues_count ?? 0;
    }

    const stats: IRepositoryStats = {
      total: repos.length,
      public: publicCount,
      private: privateCount,
      forks: forksCount,
      original: originalCount,
      archived: archivedCount,
      disabled: disabledCount,
      totalStars,
      totalForks,
      totalWatchers,
      openIssuesCount,
    };

    logger.info({ username }, 'Successfully calculated repository stats');
    return stats;
  }
}
