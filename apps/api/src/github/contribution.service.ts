import { injectable, inject } from 'tsyringe';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface IContributionDay {
  color: string;
  contributionCount: number;
  date: string;
  weekday: number;
}

export interface IContributionWeek {
  contributionDays: IContributionDay[];
}

export interface IContributionCalendar {
  totalContributions: number;
  weeks: IContributionWeek[];
}

export interface IContributionStats {
  username: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  contributionCalendar: IContributionCalendar;
}

interface IGraphQLContributionCalendar {
  totalContributions: number;
  weeks: Array<{
    contributionDays: IContributionDay[];
  }>;
}

interface IGraphQLResponse {
  user?: {
    standardCalendar: {
      contributionCalendar: IGraphQLContributionCalendar;
    };
    [key: string]:
      | {
          contributionCalendar: IGraphQLContributionCalendar;
        }
      | any;
  };
}

@injectable()
export class ContributionService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Calculates contribution statistics for a user, including all-time total contributions,
   * current streak, longest streak, and the standard 1-year contribution calendar.
   */
  public async getContributionStats(
    username?: string,
    options?: { token?: string },
  ): Promise<IContributionStats> {
    logger.info({ username, hasToken: !!options?.token }, 'Calculating contribution stats');

    let targetUsername = username;
    let createdAt = '';

    // 1. Fetch the user's login and account creation date
    if (!targetUsername) {
      const data = await this.gitHubService.graphql<{
        viewer: { login: string; createdAt: string };
      }>(`query { viewer { login createdAt } }`, {}, options?.token);
      targetUsername = data.viewer.login;
      createdAt = data.viewer.createdAt;
    } else {
      const data = await this.gitHubService.graphql<{
        user: { login: string; createdAt: string } | null;
      }>(
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

    logger.debug(
      { username: targetUsername, createdAt },
      'Fetched target user profile for contributions',
    );

    // 2. Define the year ranges
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const signupDate = new Date(createdAt);
    const signupYear = signupDate.getUTCFullYear();

    // 3. Construct GraphQL query to fetch standard calendar and all historical years
    let graphQLQuery = `
      query($login: String!) {
        user(login: $login) {
          standardCalendar: contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  color
                  contributionCount
                  date
                  weekday
                }
              }
            }
          }
    `;

    for (let Y = signupYear; Y <= currentYear; Y++) {
      let fromDate: Date;
      let toDate: Date;

      if (Y === currentYear) {
        const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
        fromDate = startOfYear < signupDate ? signupDate : startOfYear;
        toDate = now;
      } else {
        const startOfYear = new Date(Date.UTC(Y, 0, 1, 0, 0, 0, 0));
        fromDate = Y === signupYear ? signupDate : startOfYear;
        toDate = new Date(Date.UTC(Y, 11, 31, 23, 59, 59, 999));
      }

      graphQLQuery += `
        year_${Y}: contributionsCollection(from: "${fromDate.toISOString()}", to: "${toDate.toISOString()}") {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                color
                contributionCount
                date
                weekday
              }
            }
          }
        }
      `;
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

    // 5. Aggregate all days and calculate total contributions
    const allDays: IContributionDay[] = [];
    let totalContributions = 0;

    for (let Y = signupYear; Y <= currentYear; Y++) {
      const collection = statsData.user[`year_${Y}`];
      if (collection?.contributionCalendar) {
        totalContributions += collection.contributionCalendar.totalContributions;
        for (const week of collection.contributionCalendar.weeks) {
          for (const day of week.contributionDays) {
            allDays.push(day);
          }
        }
      }
    }

    // 6. Chronologically sort and deduplicate days by date
    allDays.sort((a, b) => a.date.localeCompare(b.date));

    const seenDates = new Set<string>();
    const uniqueDays = allDays.filter((day) => {
      if (seenDates.has(day.date)) {
        return false;
      }
      seenDates.add(day.date);
      return true;
    });

    // 7. Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;

    for (const day of uniqueDays) {
      if (day.contributionCount > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // 8. Calculate current streak
    let currentStreak = 0;
    let i = uniqueDays.length - 1;

    // If the latest day in the calendar has 0 contributions, check the day before
    if (i >= 0) {
      const lastDay = uniqueDays[i];
      if (lastDay && lastDay.contributionCount === 0) {
        i--;
      }
    }

    while (i >= 0) {
      const currentDay = uniqueDays[i];
      if (currentDay && currentDay.contributionCount > 0) {
        currentStreak++;
        i--;
      } else {
        break;
      }
    }

    const stats: IContributionStats = {
      username: targetUsername,
      totalContributions,
      currentStreak,
      longestStreak,
      contributionCalendar: statsData.user.standardCalendar.contributionCalendar,
    };

    logger.info({ username: targetUsername }, 'Successfully calculated contribution stats');
    return stats;
  }
}
