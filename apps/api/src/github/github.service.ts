/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/dot-notation */
import { injectable } from 'tsyringe';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username?: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    [key: string]: any;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  [key: string]: any;
}

@injectable()
export class GitHubService {
  private readonly defaultToken: string;

  constructor() {
    this.defaultToken = env.GITHUB_TOKEN;
  }

  /**
   * Helper to perform request to GitHub API.
   */
  private async request<T>(endpoint: string, token?: string): Promise<T> {
    const url = `https://api.github.com${endpoint}`;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'GitProfileStats-API',
    };

    const activeToken = token || this.defaultToken;
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      logger.debug({ url, hasToken: !!activeToken }, 'Sending request to GitHub API');
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        logger.error(
          { url, status: response.status, statusText: response.statusText, errorText },
          'GitHub API request failed',
        );
        throw new Error(
          `GitHub API error: ${response.status.toString()} ${response.statusText} - ${errorText}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      logger.error({ url, error }, 'Error calling GitHub API');
      throw error;
    }
  }

  /**
   * Fetches the profile of the authenticated user.
   * If a token is provided, uses that token; otherwise, falls back to default.
   */
  public async getAuthenticatedUser(token?: string): Promise<GitHubUser> {
    return this.request<GitHubUser>('/user', token);
  }

  /**
   * Fetches the profile of a user by username.
   */
  public async getUser(username: string, token?: string): Promise<GitHubUser> {
    return this.request<GitHubUser>(`/users/${username}`, token);
  }


  /**
   * Fetches repositories.
   * If username is provided, fetches public repositories for that user.
   * If username is not provided, fetches repositories for the authenticated user.
   */
  public async getRepositories(
    username?: string,
    options?: { token?: string; page?: number; perPage?: number } | string,
  ): Promise<GitHubRepository[]> {
    let token: string | undefined;
    let page: number | undefined;
    let perPage: number | undefined;

    if (typeof options === 'string') {
      token = options;
    } else if (options) {
      token = options.token;
      page = options.page;
      perPage = options.perPage;
    }

    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (perPage) queryParams.append('per_page', perPage.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const endpoint = username
      ? `/users/${username}/repos${queryString}`
      : `/user/repos${queryString}`;

    return this.request<GitHubRepository[]>(endpoint, token);
  }

  /**
   * Fetches details of a specific repository.
   */
  public async getRepository(
    owner: string,
    repo: string,
    token?: string,
  ): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(`/repos/${owner}/${repo}`, token);
  }

  /**
   * Fetches languages of a specific repository.
   */
  public async getRepositoryLanguages(
    owner: string,
    repo: string,
    token?: string,
  ): Promise<Record<string, number>> {
    return this.request<Record<string, number>>(`/repos/${owner}/${repo}/languages`, token);
  }

  /**
   * Fetches every repository by handling pagination automatically.
   * If a token is provided (or default is set) and no username is specified,
   * it includes private repositories the token has access to.
   */
  public async getAllRepositories(
    username?: string,
    options?: { token?: string } | string,
  ): Promise<GitHubRepository[]> {
    let token: string | undefined;
    if (typeof options === 'string') {
      token = options;
    } else if (options) {
      token = options.token;
    }

    const allRepos: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const repos = await this.getRepositories(username, { token, page, perPage });
      allRepos.push(...repos);
      if (repos.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allRepos;
  }

  /**
   * Helper to perform GraphQL requests against the GitHub GraphQL API.
   */
  public async graphql<T>(
    query: string,
    variables?: Record<string, any>,
    token?: string,
  ): Promise<T> {
    const url = 'https://api.github.com/graphql';
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'GitProfileStats-API',
    };

    const activeToken = token || this.defaultToken;
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      logger.debug({ hasToken: !!activeToken }, 'Sending request to GitHub GraphQL API');
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        logger.error(
          { status: response.status, statusText: response.statusText, errorText },
          'GitHub GraphQL API request failed',
        );
        throw new Error(
          `GitHub GraphQL error: ${response.status.toString()} ${response.statusText} - ${errorText}`,
        );
      }

      const result = (await response.json()) as { data?: T; errors?: any[] };
      if (result.errors && result.errors.length > 0) {
        logger.error({ errors: result.errors }, 'GitHub GraphQL returned errors');
        throw new Error(`GitHub GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      if (!result.data) {
        throw new Error('GitHub GraphQL returned no data');
      }

      return result.data;
    } catch (error) {
      logger.error({ error }, 'Error calling GitHub GraphQL API');
      throw error;
    }
  }
}
