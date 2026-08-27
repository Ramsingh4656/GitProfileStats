import { injectable, inject } from 'tsyringe';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface IContributedRepo {
  name: string;
  owner: string;
  primaryLanguage: {
    name: string;
    color: string | null;
  } | null;
  contributionCount: number;
}

interface IGraphQLResponse {
  user?: {
    contributionsCollection: {
      commitContributionsByRepository: {
        repository: {
          name: string;
          owner: {
            login: string;
          };
          primaryLanguage: {
            name: string;
            color: string | null;
          } | null;
        };
        contributions: {
          totalCount: number;
        };
      }[];
    };
  };
}

@injectable()
export class ContributedReposService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Fetches the user's top contributed repositories sorted by contribution activity.
   */
  public async getTopContributedRepos(
    username?: string,
    options?: { token?: string },
  ): Promise<IContributedRepo[]> {
    logger.info({ username, hasToken: !!options?.token }, 'Fetching top contributed repositories');

    let targetUsername = username;

    // Fetch target user's login if not provided
    if (!targetUsername) {
      const data = await this.gitHubService.graphql<{
        viewer: { login: string };
      }>(`query { viewer { login } }`, {}, options?.token);
      targetUsername = data.viewer.login;
    } else {
      const data = await this.gitHubService.graphql<{
        user: { login: string } | null;
      }>(
        `query($login: String!) { user(login: $login) { login } }`,
        { login: targetUsername },
        options?.token,
      );
      if (!data.user) {
        throw new Error(`User ${targetUsername} not found`);
      }
      targetUsername = data.user.login;
    }

    logger.debug({ username: targetUsername }, 'Fetched target user profile for top contributed repos');

    const query = `
      query($login: String!) {
        user(login: $login) {
          contributionsCollection {
            commitContributionsByRepository(maxRepositories: 100) {
              repository {
                name
                owner {
                  login
                }
                primaryLanguage {
                  name
                  color
                }
              }
              contributions {
                totalCount
              }
            }
          }
        }
      }
    `;

    const statsData = await this.gitHubService.graphql<IGraphQLResponse>(
      query,
      { login: targetUsername },
      options?.token,
    );

    if (!statsData.user) {
      throw new Error(`Failed to retrieve contribution data for ${targetUsername}`);
    }

    const reposData = statsData.user.contributionsCollection.commitContributionsByRepository || [];

    const repos: IContributedRepo[] = reposData.map((item) => ({
      name: item.repository.name,
      owner: item.repository.owner.login,
      primaryLanguage: item.repository.primaryLanguage
        ? {
            name: item.repository.primaryLanguage.name,
            color: item.repository.primaryLanguage.color,
          }
        : null,
      contributionCount: item.contributions.totalCount,
    }));

    // Sort by contribution count descending, then alphabetically by repository name
    repos.sort((a, b) => {
      if (b.contributionCount !== a.contributionCount) {
        return b.contributionCount - a.contributionCount;
      }
      return a.name.localeCompare(b.name);
    });

    return repos;
  }
}
