import { injectable, inject } from 'tsyringe';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface IPullRequestStats {
  username: string;
  totalPullRequests: number;
  openPullRequests: number;
  closedPullRequests: number;
  mergedPullRequests: number;
}

interface IGraphQLResponse {
  user?: {
    pullRequests: {
      totalCount: number;
    };
    openPRs: {
      totalCount: number;
    };
    closedPRs: {
      totalCount: number;
    };
    mergedPRs: {
      totalCount: number;
    };
  };
}

@injectable()
export class PullRequestService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Calculates pull request statistics (total, open, closed, merged) for a user.
   */
  public async getPullRequestStats(
    username?: string,
    options?: { token?: string },
  ): Promise<IPullRequestStats> {
    logger.info({ username, hasToken: !!options?.token }, 'Calculating pull request stats');

    let targetUsername = username;

    // 1. Fetch user login if not provided
    if (!targetUsername) {
      const data = await this.gitHubService.graphql<{ viewer: { login: string } }>(
        `query { viewer { login } }`,
        {},
        options?.token,
      );
      targetUsername = data.viewer.login;
    } else {
      const data = await this.gitHubService.graphql<{ user: { login: string } | null }>(
        `query($login: String!) { user(login: $login) { login } }`,
        { login: targetUsername },
        options?.token,
      );
      if (!data.user) {
        throw new Error(`User ${targetUsername} not found`);
      }
      targetUsername = data.user.login;
    }

    logger.debug({ username: targetUsername }, 'Fetched target user profile for pull requests');

    // 2. Fetch pull request counts grouped by state
    const query = `
      query($login: String!) {
        user(login: $login) {
          pullRequests {
            totalCount
          }
          openPRs: pullRequests(states: [OPEN]) {
            totalCount
          }
          closedPRs: pullRequests(states: [CLOSED]) {
            totalCount
          }
          mergedPRs: pullRequests(states: [MERGED]) {
            totalCount
          }
        }
      }
    `;

    const data = await this.gitHubService.graphql<IGraphQLResponse>(
      query,
      { login: targetUsername },
      options?.token,
    );

    if (!data.user) {
      throw new Error(`Failed to retrieve pull request data for ${targetUsername}`);
    }

    const { pullRequests, openPRs, closedPRs, mergedPRs } = data.user;

    const stats: IPullRequestStats = {
      username: targetUsername,
      totalPullRequests: pullRequests.totalCount,
      openPullRequests: openPRs.totalCount,
      closedPullRequests: closedPRs.totalCount,
      mergedPullRequests: mergedPRs.totalCount,
    };

    logger.info({ username: targetUsername }, 'Successfully calculated pull request stats');
    return stats;
  }
}
