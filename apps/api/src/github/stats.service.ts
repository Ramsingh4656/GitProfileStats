import { injectable, inject } from 'tsyringe';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface IGitHubStats {
  username: string;
  name: string | null;
  followers: number;
  following: number;
  publicRepositories: number;
  privateRepositories: number;
  totalStars: number;
  totalForks: number;
}

@injectable()
export class StatsService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Generates aggregated statistics for a user.
   */
  public async getStats(username?: string, options?: { token?: string }): Promise<IGitHubStats> {
    logger.info({ username, hasToken: !!options?.token }, 'Generating profile stats');

    // 1. Fetch user profile
    const profile = username
      ? await this.gitHubService.getUser(username, options?.token)
      : await this.gitHubService.getAuthenticatedUser(options?.token);

    logger.debug({ username: profile.login }, 'Fetched user profile');

    // 2. Fetch all repositories
    const repos = await this.gitHubService.getAllRepositories(username, options);
    logger.debug({ count: repos.length }, 'Fetched repositories list');

    // 3. Aggregate statistics
    let totalStars = 0;
    let totalForks = 0;

    for (const repo of repos) {
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
    }

    // Count private repos from fetched list, or fallback to profile fields if available
    const privateReposFromList = repos.filter((repo) => repo.private).length;

    const profileRecord = profile as unknown as Record<string, unknown>;
    const totalPrivateRepos =
      typeof profileRecord.total_private_repos === 'number' ? profileRecord.total_private_repos : 0;
    const ownedPrivateRepos =
      typeof profileRecord.owned_private_repos === 'number' ? profileRecord.owned_private_repos : 0;

    const profilePrivateRepos = totalPrivateRepos || ownedPrivateRepos;
    const privateRepositories = Math.max(privateReposFromList, profilePrivateRepos);

    const stats: IGitHubStats = {
      username: profile.login,
      name: profile.name,
      followers: profile.followers,
      following: profile.following,
      publicRepositories: profile.public_repos,
      privateRepositories,
      totalStars,
      totalForks,
    };

    logger.info({ username: stats.username }, 'Successfully generated stats');
    return stats;
  }
}
