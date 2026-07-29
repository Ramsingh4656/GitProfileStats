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

    // 1. Fetch all repositories
    const repos = await this.gitHubService.getAllRepositories(username, options);
    logger.debug({ count: repos.length }, 'Fetched repositories list');

    // 2. Fetch language data for every repository in parallel
    const token = options?.token;
    const languagePromises = repos.map((repo) =>
      this.gitHubService
        .getRepositoryLanguages(repo.owner.login, repo.name, token)
        .catch((err: unknown) => {
          logger.warn(
            { repo: repo.full_name, err: err instanceof Error ? err.message : err },
            'Failed to fetch languages for repository',
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
      'Language stats aggregation completed',
    );
    return result;
  }
}
