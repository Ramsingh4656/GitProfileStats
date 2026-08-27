import { injectable, inject } from 'tsyringe';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface IIssueStats {
  username: string;
  totalIssuesOpened: number;
  totalIssuesClosed: number;
  averageCloseTimeMs: number;
  averageCloseTimeDays: number;
  averageCloseTimeHours: number;
  averageCloseTimeFormatted: string;
}

interface IInitialIssuesResponse {
  user?: {
    allIssues: {
      totalCount: number;
    };
    closedIssues: {
      totalCount: number;
    };
  };
}

interface IClosedIssuesResponse {
  user?: {
    closedIssuesList: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: {
        createdAt: string;
        closedAt: string | null;
      }[];
    };
  };
}

@injectable()
export class IssueStatisticsService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Calculates issue statistics (total opened, total closed, average close time) for a user.
   */
  public async getIssueStats(
    username?: string,
    options?: { token?: string },
  ): Promise<IIssueStats> {
    logger.info({ username, hasToken: !!options?.token }, 'Calculating issue stats');

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

    logger.debug({ username: targetUsername }, 'Fetched target user profile for issues');

    // 2. Fetch total issue counts (opened and closed)
    const initialQuery = `
      query($login: String!) {
        user(login: $login) {
          allIssues: issues {
            totalCount
          }
          closedIssues: issues(states: [CLOSED]) {
            totalCount
          }
        }
      }
    `;

    const initialData: IInitialIssuesResponse =
      await this.gitHubService.graphql<IInitialIssuesResponse>(
        initialQuery,
        { login: targetUsername },
        options?.token,
      );

    if (!initialData.user) {
      throw new Error(`Failed to retrieve issue counts for ${targetUsername}`);
    }

    const totalIssuesOpened = initialData.user.allIssues.totalCount;
    const totalIssuesClosed = initialData.user.closedIssues.totalCount;

    logger.debug(
      { username: targetUsername, totalIssuesOpened, totalIssuesClosed },
      'Fetched total issue counts',
    );

    // 3. Paginate closed issues to get createdAt and closedAt timestamps
    let hasNextPage = totalIssuesClosed > 0;
    let cursor: string | null = null;
    let fetchedCount = 0;
    const maxClosedIssuesToFetch = 1000; // Cap to 10 pages for safety/performance
    const closedIssuesDurations: number[] = [];

    while (hasNextPage && fetchedCount < maxClosedIssuesToFetch) {
      const pageQuery = `
        query($login: String!, $cursor: String) {
          user(login: $login) {
            closedIssuesList: issues(states: [CLOSED], first: 100, after: $cursor) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                createdAt
                closedAt
              }
            }
          }
        }
      `;

      const pageData: IClosedIssuesResponse =
        await this.gitHubService.graphql<IClosedIssuesResponse>(
          pageQuery,
          { login: targetUsername, cursor },
          options?.token,
        );

      if (!pageData.user?.closedIssuesList) {
        break;
      }

      const connection = pageData.user.closedIssuesList;
      const nodes = connection.nodes || [];

      for (const node of nodes) {
        if (node.createdAt && node.closedAt) {
          const created = new Date(node.createdAt).getTime();
          const closed = new Date(node.closedAt).getTime();
          const duration = closed - created;
          if (duration >= 0) {
            closedIssuesDurations.push(duration);
          }
        }
      }

      fetchedCount += nodes.length;
      hasNextPage = connection.pageInfo.hasNextPage;
      cursor = connection.pageInfo.endCursor;

      if (nodes.length === 0 || !cursor) {
        break;
      }
    }

    // 4. Calculate average close time
    let averageCloseTimeMs = 0;
    if (closedIssuesDurations.length > 0) {
      const sum = closedIssuesDurations.reduce((acc, val) => acc + val, 0);
      averageCloseTimeMs = sum / closedIssuesDurations.length;
    }

    const averageCloseTimeHours = parseFloat((averageCloseTimeMs / (1000 * 60 * 60)).toFixed(2));
    const averageCloseTimeDays = parseFloat(
      (averageCloseTimeMs / (1000 * 60 * 60 * 24)).toFixed(2),
    );

    // Format helper: days and hours
    let averageCloseTimeFormatted = '0d 0h';
    if (averageCloseTimeMs > 0) {
      const totalSeconds = Math.floor(averageCloseTimeMs / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      if (days > 0) {
        averageCloseTimeFormatted = `${days}d ${hours}h`;
      } else if (hours > 0) {
        averageCloseTimeFormatted = `${hours}h ${minutes}m`;
      } else {
        averageCloseTimeFormatted = `${minutes}m`;
      }
    }

    const stats: IIssueStats = {
      username: targetUsername,
      totalIssuesOpened,
      totalIssuesClosed,
      averageCloseTimeMs,
      averageCloseTimeDays,
      averageCloseTimeHours,
      averageCloseTimeFormatted,
    };

    logger.info({ username: targetUsername }, 'Successfully calculated issue stats');
    return stats;
  }
}
