import { injectable, inject } from 'tsyringe';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface ILanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  repositoryCount: number;
}

export type LanguageCollectionResult = ILanguageStat[];

export interface ILanguageCollectorService {
  collectLanguages(
    username?: string,
    options?: { token?: string },
  ): Promise<LanguageCollectionResult>;
}

@injectable()
export class LanguageCollectorService implements ILanguageCollectorService {
  constructor(
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
  ) {}

  /**
   * Collects and aggregates language statistics across all repositories of a user.
   */
  public async collectLanguages(
    username?: string,
    options?: { token?: string },
  ): Promise<LanguageCollectionResult> {
    logger.info({ username, hasToken: !!options?.token }, 'Collecting language stats');

    let targetUsername = username;
    if (options?.token && targetUsername) {
      try {
        const authUser = await this.gitHubService.getAuthenticatedUser(options.token);
        if (authUser.login.toLowerCase() === targetUsername.toLowerCase()) {
          targetUsername = undefined;
        }
      } catch (err) {
        logger.warn({ err }, 'Failed to check authenticated user in collectLanguages');
      }
    }

    try {
      return await this.collectLanguagesGraphQL(targetUsername, options);
    } catch (err: unknown) {
      logger.warn(
        { err: err instanceof Error ? err.message : err },
        'Failed to collect languages using GraphQL, falling back to REST',
      );
      return await this.collectLanguagesREST(targetUsername, options);
    }
  }

  /**
   * Optimized method using GraphQL to collect languages in 1 (or paginated) request instead of N REST requests.
   */
  private async collectLanguagesGraphQL(
    username?: string,
    options?: { token?: string },
  ): Promise<LanguageCollectionResult> {
    const combinedBytes: Record<string, number> = {};
    const combinedRepoCount: Record<string, number> = {};
    let totalBytes = 0;
    let hasNextPage = true;
    let cursor: string | null = null;
    const token = options?.token;

    while (hasNextPage) {
      let query: string;
      let variables: Record<string, any>;

      if (username) {
        query = `
          query($login: String!, $cursor: String) {
            user(login: $login) {
              repositories(first: 100, after: $cursor, ownerAffiliations: OWNER) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
                    edges {
                      size
                      node {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `;
        variables = { login: username, cursor };
      } else {
        query = `
          query($cursor: String) {
            viewer {
              repositories(first: 100, after: $cursor, ownerAffiliations: OWNER) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
                    edges {
                      size
                      node {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `;
        variables = { cursor };
      }

      const response = await this.gitHubService.graphql<any>(query, variables, token);
      const data = username ? response?.user : response?.viewer;
      if (!data || !data.repositories) {
        break;
      }

      const repos = data.repositories.nodes || [];
      for (const repo of repos) {
        if (repo?.languages?.edges) {
          for (const edge of repo.languages.edges) {
            const lang = edge?.node?.name;
            const bytes = edge?.size;
            if (lang && bytes > 0) {
              combinedBytes[lang] = (combinedBytes[lang] ?? 0) + bytes;
              combinedRepoCount[lang] = (combinedRepoCount[lang] ?? 0) + 1;
              totalBytes += bytes;
            }
          }
        }
      }

      hasNextPage = data.repositories.pageInfo.hasNextPage;
      cursor = data.repositories.pageInfo.endCursor;
    }

    const result: LanguageCollectionResult = [];
    for (const [lang, bytes] of Object.entries(combinedBytes)) {
      const percentage = totalBytes > 0 ? Number(((bytes / totalBytes) * 100).toFixed(2)) : 0;
      result.push({
        language: lang,
        bytes,
        percentage,
        repositoryCount: combinedRepoCount[lang] ?? 0,
      });
    }

    result.sort((a, b) => b.bytes - a.bytes);

    logger.info(
      { totalBytes, languagesCount: result.length },
      'Language stats GraphQL aggregation completed',
    );
    return result;
  }

  /**
   * Fallback REST method.
   */
  private async collectLanguagesREST(
    username?: string,
    options?: { token?: string },
  ): Promise<LanguageCollectionResult> {
    // 1. Fetch all repositories
    const repos = await this.gitHubService.getAllRepositories(username, options);
    logger.debug({ count: repos.length }, 'Fetched repositories list via REST');

    // 2. Fetch language data for every repository in parallel
    const token = options?.token;
    const languagePromises = repos.map((repo) =>
      this.gitHubService
        .getRepositoryLanguages(repo.owner.login, repo.name, token)
        .catch((err: unknown) => {
          logger.warn(
            { repo: repo.full_name, err: err instanceof Error ? err.message : err },
            'Failed to fetch languages for repository via REST',
          );
          return {};
        }),
    );

    const languagesArray = await Promise.all(languagePromises);

    // 3. Aggregate all languages
    const combinedBytes: Record<string, number> = {};
    const combinedRepoCount: Record<string, number> = {};
    let totalBytes = 0;

    for (const repoLanguages of languagesArray) {
      for (const [lang, bytes] of Object.entries(repoLanguages)) {
        if (bytes > 0) {
          combinedBytes[lang] = (combinedBytes[lang] ?? 0) + bytes;
          combinedRepoCount[lang] = (combinedRepoCount[lang] ?? 0) + 1;
          totalBytes += bytes;
        }
      }
    }

    // 4. Calculate percentages and construct list
    const result: LanguageCollectionResult = [];
    for (const [lang, bytes] of Object.entries(combinedBytes)) {
      const percentage = totalBytes > 0 ? Number(((bytes / totalBytes) * 100).toFixed(2)) : 0;
      result.push({
        language: lang,
        bytes,
        percentage,
        repositoryCount: combinedRepoCount[lang] ?? 0,
      });
    }

    // 5. Sort descending by usage (bytes)
    result.sort((a, b) => b.bytes - a.bytes);

    logger.info(
      { totalBytes, languagesCount: result.length },
      'Language stats REST aggregation completed',
    );
    return result;
  }
}
