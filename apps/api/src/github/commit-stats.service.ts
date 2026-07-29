import { injectable, inject } from 'tsyringe';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface ICommitStats {
  username: string;
  totalCommits: number;
  commitsThisYear: number;
  commitsThisMonth: number;
  commitsThisWeek: number;
}

interface IContributionData {
  totalCommitContributions: number;
  restrictedContributionsCount: number;
}

interface IGraphQLResponse {
  user?: {
    login: string;
    createdAt: string;
    thisYear: IContributionData;
    thisMonth: IContributionData;
    thisWeek: IContributionData;
    [key: string]: unknown;
  };
}

@injectable()
export class CommitStatsService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Calculates commit statistics for a user (total, this year, this month, this week).
   */
  public async getCommitStats(
    username?: string,
    options?: { token?: string },
  ): Promise<ICommitStats> {
    logger.info({ username, hasToken: !!options?.token }, 'Calculating commit stats');

    let targetUsername = username;
    let createdAt = '';

    // 1. Fetch the user's login and account creation date
    if (!targetUsername) {
      const data = await this.gitHubService.graphql<{ viewer: { login: string; createdAt: string } }>(
        `query { viewer { login createdAt } }`,
        {},
        options?.token,
      );
      targetUsername = data.viewer.login;
      createdAt = data.viewer.createdAt;
    } else {
      const data = await this.gitHubService.graphql<{ user: { login: string; createdAt: string } | null }>(
        `query($login: String!) { user(login: $login) { login createdAt } }`,
        { login: targetUsername },
        options?.token,
      );
      if (!data.user) {
        throw new Error(`User ${targetUsername} not found`);
      }
      targetUsername = data.user.login;
      createdAt = data.user.createdAt;
    }

    logger.debug({ username: targetUsername, createdAt }, 'Fetched target user profile');

    // 2. Define the date ranges for: this year, this month, this week
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const signupDate = new Date(createdAt);
    const signupYear = signupDate.getUTCFullYear();

    const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
    const startOfMonth = new Date(Date.UTC(currentYear, now.getUTCMonth(), 1, 0, 0, 0, 0));
    const startOfWeek = new Date(now);
    
    // getUTCDay() returns 0 for Sunday, 1 for Monday, etc.
    startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);

    // Bound start dates to signupDate so we don't query before the account existed
    const yearStart = startOfYear < signupDate ? signupDate : startOfYear;
    const monthStart = startOfMonth < signupDate ? signupDate : startOfMonth;
    const weekStart = startOfWeek < signupDate ? signupDate : startOfWeek;

    const yearStartStr = yearStart.toISOString();
    const monthStartStr = monthStart.toISOString();
    const weekStartStr = weekStart.toISOString();
    const nowStr = now.toISOString();

    // 3. Construct the GraphQL query
    let graphQLQuery = `
      query($login: String!) {
        user(login: $login) {
          thisYear: contributionsCollection(from: "${yearStartStr}", to: "${nowStr}") {
            totalCommitContributions
            restrictedContributionsCount
          }
          thisMonth: contributionsCollection(from: "${monthStartStr}", to: "${nowStr}") {
            totalCommitContributions
            restrictedContributionsCount
          }
          thisWeek: contributionsCollection(from: "${weekStartStr}", to: "${nowStr}") {
            totalCommitContributions
            restrictedContributionsCount
          }
    `;

    if (signupYear < currentYear) {
      for (let Y = signupYear; Y < currentYear; Y++) {
        const fromStr = Y === signupYear ? createdAt : new Date(Date.UTC(Y, 0, 1, 0, 0, 0, 0)).toISOString();
        const toStr = new Date(Date.UTC(Y, 11, 31, 23, 59, 59, 999)).toISOString();
        graphQLQuery += `
          year_${Y.toString()}: contributionsCollection(from: "${fromStr}", to: "${toStr}") {
            totalCommitContributions
            restrictedContributionsCount
          }
        `;
      }
    }

    graphQLQuery += `
        }
      }
    `;

    // 4. Execute the query
    const statsData = await this.gitHubService.graphql<IGraphQLResponse>(
      graphQLQuery,
      { login: targetUsername },
      options?.token,
    );

    if (!statsData.user) {
      throw new Error(`Failed to retrieve contribution data for ${targetUsername}`);
    }

    const { thisYear, thisMonth, thisWeek } = statsData.user;

    const commitsThisYear = thisYear.totalCommitContributions + thisYear.restrictedContributionsCount;
    const commitsThisMonth = thisMonth.totalCommitContributions + thisMonth.restrictedContributionsCount;
    const commitsThisWeek = thisWeek.totalCommitContributions + thisWeek.restrictedContributionsCount;

    let totalCommits = commitsThisYear;

    if (signupYear < currentYear) {
      for (let Y = signupYear; Y < currentYear; Y++) {
        const yearData = statsData.user[`year_${Y.toString()}`] as IContributionData | undefined;
        if (yearData) {
          totalCommits += yearData.totalCommitContributions + yearData.restrictedContributionsCount;
        }
      }
    }

    const stats: ICommitStats = {
      username: targetUsername,
      totalCommits,
      commitsThisYear,
      commitsThisMonth,
      commitsThisWeek,
    };

    logger.info({ username: targetUsername }, 'Successfully calculated commit stats');
    return stats;
  }
}
