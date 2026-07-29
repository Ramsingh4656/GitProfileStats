import { injectable, inject } from 'tsyringe';
import { GitHubService, GitHubRepository } from './github.service.js';
import { logger } from '../config/logger.js';

export interface IRankedRepository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  forks: number;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface IRepositoryRankings {
  mostStarred: IRankedRepository | null;
  mostForked: IRankedRepository | null;
  largest: IRankedRepository | null;
  smallest: IRankedRepository | null;
  newest: IRankedRepository | null;
  oldest: IRankedRepository | null;
  mostRecentlyUpdated: IRankedRepository | null;
}

@injectable()
export class RepositoryRankingService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Calculates repository rankings for a user.
   */
  public async getRepositoryRankings(
    username?: string,
    options?: { token?: string },
  ): Promise<IRepositoryRankings> {
    logger.info({ username, hasToken: !!options?.token }, 'Calculating repository rankings');

    const repos = await this.gitHubService.getAllRepositories(username, options);
    logger.debug({ count: repos.length }, 'Fetched repositories list for ranking calculation');

    const firstRepo = repos[0];
    if (!firstRepo) {
      logger.info({ username }, 'No repositories found, returning null rankings');
      return {
        mostStarred: null,
        mostForked: null,
        largest: null,
        smallest: null,
        newest: null,
        oldest: null,
        mostRecentlyUpdated: null,
      };
    }

    let mostStarred = firstRepo;
    let mostForked = firstRepo;
    let largest = firstRepo;
    let smallest = firstRepo;
    let newest = firstRepo;
    let oldest = firstRepo;
    let mostRecentlyUpdated = firstRepo;

    for (let i = 1; i < repos.length; i++) {
      const repo = repos[i];
      if (!repo) continue;

      // Most starred
      if (repo.stargazers_count > mostStarred.stargazers_count) {
        mostStarred = repo;
      }

      // Most forked
      if (repo.forks_count > mostForked.forks_count) {
        mostForked = repo;
      }

      // Largest size
      if (repo.size > largest.size) {
        largest = repo;
      }

      // Smallest size
      if (repo.size < smallest.size) {
        smallest = repo;
      }

      // Newest (compare created_at)
      if (Date.parse(repo.created_at) > Date.parse(newest.created_at)) {
        newest = repo;
      }

      // Oldest (compare created_at)
      if (Date.parse(repo.created_at) < Date.parse(oldest.created_at)) {
        oldest = repo;
      }

      // Most recently updated (compare updated_at)
      if (Date.parse(repo.updated_at) > Date.parse(mostRecentlyUpdated.updated_at)) {
        mostRecentlyUpdated = repo;
      }
    }

    const rankings: IRepositoryRankings = {
      mostStarred: this.mapRepository(mostStarred),
      mostForked: this.mapRepository(mostForked),
      largest: this.mapRepository(largest),
      smallest: this.mapRepository(smallest),
      newest: this.mapRepository(newest),
      oldest: this.mapRepository(oldest),
      mostRecentlyUpdated: this.mapRepository(mostRecentlyUpdated),
    };

    logger.info({ username }, 'Successfully calculated repository rankings');
    return rankings;
  }

  private mapRepository(repo: GitHubRepository): IRankedRepository {
    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      size: repo.size,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
    };
  }
}
