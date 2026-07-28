import { injectable, inject } from 'tsyringe';
import { GitHubService } from './github.service.js';
import { logger } from '../config/logger.js';

export interface ILanguageStat {
  bytes: number;
  percentage: number;
}

export type LanguageCollectionResult = Record<string, ILanguageStat>;

@injectable()
export class LanguageCollectorService {
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
    const combined: Record<string, number> = {};
    let totalBytes = 0;

    for (const repoLanguages of languagesArray) {
      for (const [lang, bytes] of Object.entries(repoLanguages)) {
        combined[lang] = (combined[lang] ?? 0) + bytes;
        totalBytes += bytes;
      }
    }

    // 4. Calculate percentages
    const result: LanguageCollectionResult = {};
    for (const [lang, bytes] of Object.entries(combined)) {
      const percentage = totalBytes > 0 ? Number(((bytes / totalBytes) * 100).toFixed(2)) : 0;
      result[lang] = {
        bytes,
        percentage,
      };
    }

    logger.info(
      { totalBytes, languagesCount: Object.keys(result).length },
      'Language stats aggregation completed',
    );
    return result;
  }
}
