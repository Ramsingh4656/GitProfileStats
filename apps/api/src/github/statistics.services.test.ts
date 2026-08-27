import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatsService } from './stats.service.js';
import { RepositoryStatsService } from './repository-stats.service.js';
import { RepositoryRankingService } from './repository-ranking.service.js';
import { LanguageCollectorService } from './language-collector.service.js';
import { CommitStatsService } from './commit-stats.service.js';
import { ContributionService } from './contribution.service.js';
import { PullRequestService } from './pull-request.service.js';
import { IssueStatisticsService } from './issue-statistics.service.js';
import { GitHubStatisticsService } from './github-statistics.service.js';
import { GitHubService } from './github.service.js';

describe('Statistics Services', () => {
  let mockGitHubService: any;

  beforeEach(() => {
    mockGitHubService = {
      getUser: vi.fn(),
      getAuthenticatedUser: vi.fn(),
      getRepositories: vi.fn(),
      getRepository: vi.fn(),
      getRepositoryLanguages: vi.fn(),
      getAllRepositories: vi.fn(),
      graphql: vi.fn(),
    };
  });

  describe('StatsService', () => {
    it('should aggregate user stats correctly', async () => {
      mockGitHubService.getUser.mockResolvedValue({
        login: 'john_doe',
        name: 'John Doe',
        followers: 10,
        following: 5,
        public_repos: 2,
        total_private_repos: 1,
      });

      mockGitHubService.getAllRepositories.mockResolvedValue([
        { stargazers_count: 5, forks_count: 2, private: false },
        { stargazers_count: 10, forks_count: 3, private: true },
      ]);

      const service = new StatsService(mockGitHubService as unknown as GitHubService);
      const stats = await service.getStats('john_doe');

      expect(stats).toEqual({
        username: 'john_doe',
        name: 'John Doe',
        followers: 10,
        following: 5,
        publicRepositories: 2,
        privateRepositories: 1,
        totalStars: 15,
        totalForks: 5,
      });
    });
  });

  describe('RepositoryStatsService', () => {
    it('should calculate repo stats correctly', async () => {
      mockGitHubService.getAllRepositories.mockResolvedValue([
        { stargazers_count: 5, forks_count: 2, watchers_count: 5, open_issues_count: 1, size: 100, fork: false },
        { stargazers_count: 10, forks_count: 3, watchers_count: 10, open_issues_count: 2, size: 200, fork: true },
      ]);

      const service = new RepositoryStatsService(mockGitHubService as unknown as GitHubService);
      const repoStats = await service.getRepositoryStats('john_doe');

      expect(repoStats).toEqual({
        total: 2,
        public: 2,
        private: 0,
        forks: 1,
        original: 1,
        archived: 0,
        disabled: 0,
        totalStars: 15,
        totalForks: 5,
        totalWatchers: 15,
        openIssuesCount: 3,
      });
    });
  });

  describe('RepositoryRankingService', () => {
    it('should calculate repository rankings and return top starred and top forks', async () => {
      mockGitHubService.getAllRepositories.mockResolvedValue([
        { name: 'repo-A', stargazers_count: 5, forks_count: 10 },
        { name: 'repo-B', stargazers_count: 20, forks_count: 2 },
        { name: 'repo-C', stargazers_count: 15, forks_count: 5 },
      ]);

      const service = new RepositoryRankingService(mockGitHubService as unknown as GitHubService);
      const rankings = await service.getRepositoryRankings('john_doe');

      expect(rankings.mostStarred?.name).toBe('repo-B');
      expect(rankings.mostForked?.name).toBe('repo-A');
    });
  });

  describe('LanguageCollectorService', () => {
    it('should collect and calculate languages percentage correctly', async () => {
      mockGitHubService.getAllRepositories.mockResolvedValue([
        { name: 'repo-1', owner: { login: 'john_doe' } },
        { name: 'repo-2', owner: { login: 'john_doe' } },
      ]);

      mockGitHubService.getRepositoryLanguages
        .mockResolvedValueOnce({ TypeScript: 1000, JavaScript: 500 })
        .mockResolvedValueOnce({ TypeScript: 500, HTML: 500 });

      mockGitHubService.graphql.mockRejectedValue(new Error('GraphQL disabled for REST test'));

      const service = new LanguageCollectorService(mockGitHubService as unknown as GitHubService);
      const languages = await service.collectLanguages('john_doe');

      expect(languages).toEqual([
        { language: 'TypeScript', bytes: 1500, percentage: 60, repositoryCount: 2 },
        { language: 'JavaScript', bytes: 500, percentage: 20, repositoryCount: 1 },
        { language: 'HTML', bytes: 500, percentage: 20, repositoryCount: 1 },
      ]);
    });
  });

  describe('CommitStatsService', () => {
    it('should aggregate commit stats correctly via GraphQL', async () => {
      mockGitHubService.graphql
        .mockResolvedValueOnce({
          user: { login: 'john_doe', createdAt: '2026-01-01T00:00:00Z' },
        })
        .mockResolvedValueOnce({
          user: {
            thisYear: { totalCommitContributions: 100, restrictedContributionsCount: 10 },
            thisMonth: { totalCommitContributions: 20, restrictedContributionsCount: 2 },
            thisWeek: { totalCommitContributions: 5, restrictedContributionsCount: 1 },
          },
        });

      const service = new CommitStatsService(mockGitHubService as unknown as GitHubService);
      const commitStats = await service.getCommitStats('john_doe');

      expect(commitStats).toEqual({
        username: 'john_doe',
        totalCommits: 110,
        commitsThisYear: 110,
        commitsThisMonth: 22,
        commitsThisWeek: 6,
      });
    });
  });

  describe('ContributionService', () => {
    it('should calculate contribution stats and streaks correctly', async () => {
      const mockCalendar = {
        totalContributions: 150,
        weeks: [
          {
            contributionDays: [
              { color: 'green', contributionCount: 1, date: '2026-07-28', weekday: 1 },
              { color: 'green', contributionCount: 2, date: '2026-07-29', weekday: 2 },
              { color: 'none', contributionCount: 0, date: '2026-07-30', weekday: 3 },
              { color: 'green', contributionCount: 5, date: '2026-07-31', weekday: 4 },
              { color: 'green', contributionCount: 1, date: '2026-08-01', weekday: 5 },
            ],
          },
        ],
      };

      mockGitHubService.graphql
        .mockResolvedValueOnce({
          user: { login: 'john_doe', createdAt: '2026-07-28T00:00:00Z' },
        })
        .mockResolvedValueOnce({
          user: {
            standardCalendar: { contributionCalendar: mockCalendar },
            year_2026: { contributionCalendar: mockCalendar },
          },
        });

      const service = new ContributionService(mockGitHubService as unknown as GitHubService);
      const contributionStats = await service.getContributionStats('john_doe');

      expect(contributionStats.username).toBe('john_doe');
      expect(contributionStats.longestStreak).toBe(2); // 28 & 29 has count > 0; 30 has 0; 31 & 01 has count > 0.
      expect(contributionStats.currentStreak).toBe(2);
    });
  });

  describe('PullRequestService', () => {
    it('should count pull requests correctly from search query', async () => {
      mockGitHubService.graphql.mockResolvedValueOnce({
        viewer: { login: 'john_doe' },
      }).mockResolvedValueOnce({
        user: {
          pullRequests: { totalCount: 42 },
          openPRs: { totalCount: 10 },
          closedPRs: { totalCount: 20 },
          mergedPRs: { totalCount: 12 },
        },
      });

      const service = new PullRequestService(mockGitHubService as unknown as GitHubService);
      const prStats = await service.getPullRequestStats(undefined);

      expect(prStats).toEqual({
        username: 'john_doe',
        totalPullRequests: 42,
        openPullRequests: 10,
        closedPullRequests: 20,
        mergedPullRequests: 12,
      });
    });
  });

  describe('IssueStatisticsService', () => {
    it('should count issues correctly from search query', async () => {
      mockGitHubService.graphql
        .mockResolvedValueOnce({
          user: { login: 'john_doe' },
        })
        .mockResolvedValueOnce({
          user: {
            allIssues: { totalCount: 24 },
            closedIssues: { totalCount: 1 },
          },
        })
        .mockResolvedValueOnce({
          user: {
            closedIssuesList: {
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [
                { createdAt: '2026-07-28T00:00:00Z', closedAt: '2026-07-29T00:00:00Z' },
              ],
            },
          },
        });

      const service = new IssueStatisticsService(mockGitHubService as unknown as GitHubService);
      const issueStats = await service.getIssueStats('john_doe');

      expect(issueStats).toEqual({
        username: 'john_doe',
        totalIssuesOpened: 24,
        totalIssuesClosed: 1,
        averageCloseTimeMs: 86400000,
        averageCloseTimeDays: 1,
        averageCloseTimeHours: 24,
        averageCloseTimeFormatted: '1d 0h',
      });
    });
  });

  describe('GitHubStatisticsService', () => {
    it('should aggregate combined stats from all sub-services', async () => {
      const mockUserProfile = {
        bio: 'Hello world',
        location: 'San Francisco',
        company: 'GitHub',
        blog: 'https://github.blog',
        email: 'john@doe.com',
      };
      mockGitHubService.getUser.mockResolvedValue(mockUserProfile);

      const mockRepoStats = { totalRepositories: 5 };
      const mockRankings = { topStarred: [] };
      const mockLanguages = [{ language: 'TypeScript', bytes: 100 }];
      const mockCommitStats = { totalCommits: 50 };
      const mockContributionStats = { currentStreak: 3 };
      const mockPRStats = { totalPullRequests: 10 };
      const mockIssueStats = { totalIssuesOpened: 5 };

      const repoStatsService = { getRepositoryStats: vi.fn().mockResolvedValue(mockRepoStats) };
      const rankingService = { getRepositoryRankings: vi.fn().mockResolvedValue(mockRankings) };
      const languageCollector = { collectLanguages: vi.fn().mockResolvedValue(mockLanguages) };
      const commitStatsService = { getCommitStats: vi.fn().mockResolvedValue(mockCommitStats) };
      const contributionService = { getContributionStats: vi.fn().mockResolvedValue(mockContributionStats) };
      const prService = { getPullRequestStats: vi.fn().mockResolvedValue(mockPRStats) };
      const issueService = { getIssueStats: vi.fn().mockResolvedValue(mockIssueStats) };

      const service = new GitHubStatisticsService(
        mockGitHubService as any,
        repoStatsService as any,
        rankingService as any,
        languageCollector as any,
        commitStatsService as any,
        contributionService as any,
        prService as any,
        issueService as any,
      );

      const combined = await service.getCombinedStatistics('john_doe');

      expect(combined).toEqual({
        userProfile: mockUserProfile,
        repositoryStats: mockRepoStats,
        repositoryRankings: mockRankings,
        languageStats: mockLanguages,
        commitStats: mockCommitStats,
        contributionStats: mockContributionStats,
        pullRequestStats: mockPRStats,
        issueStats: mockIssueStats,
      });
    });
  });
});
