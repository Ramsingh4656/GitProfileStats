import { describe, it, expect } from 'vitest';
import {
  renderProfileCard,
  renderStatsCard,
  renderLanguagesCard,
  renderStreakCard,
  renderRepositoryCard,
} from './index.js';

describe('Card Generators', () => {
  const dummyOptions = {
    theme: 'dark',
    accent: '#ff0000',
    background: '#000000',
    borderRadius: 8,
    hideBorder: false,
    fontFamily: 'Segoe UI',
  };

  describe('renderProfileCard', () => {
    it('should generate a valid profile card SVG', async () => {
      const mockUser = {
        login: 'john_doe',
        name: 'John Doe',
        avatar_url: 'https://avatars.githubusercontent.com/u/1234?v=4',
        bio: 'Hello world',
        public_repos: 5,
        followers: 12,
        following: 15,
        created_at: '2026-01-01T00:00:00Z',
      };

      const svg = await renderProfileCard(mockUser, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('John Doe');
      expect(svg).toContain('john_doe');
      expect(svg).toContain('Hello world');
      expect(svg).toContain('12'); // Followers
    });
  });

  describe('renderStatsCard', () => {
    it('should generate a valid stats card SVG', () => {
      const mockStats = {
        username: 'john_doe',
        name: 'John Doe',
        totalStars: 42,
        totalCommits: 1337,
        totalRepositories: 8,
        pullRequests: 15,
        issues: 2,
        followers: 12,
      };

      const svg = renderStatsCard(mockStats, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('John Doe');
      expect(svg).toContain('42'); // Stars
      expect(svg).toContain('1,337'); // Commits formatting
    });
  });

  describe('renderLanguagesCard', () => {
    it('should generate a valid languages card SVG', () => {
      const mockLanguages = [
        { language: 'TypeScript', bytes: 10000, percentage: 80, repositoryCount: 3 },
        { language: 'JavaScript', bytes: 2500, percentage: 20, repositoryCount: 1 },
      ];

      const svg = renderLanguagesCard(mockLanguages, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('TypeScript');
      expect(svg).toContain('JavaScript');
      expect(svg).toContain('80%');
    });
  });

  describe('renderStreakCard', () => {
    it('should generate a valid streak card SVG', () => {
      const mockStreak = {
        username: 'john_doe',
        totalContributions: 245,
        currentStreak: 12,
        longestStreak: 25,
        contributionCalendar: {
          totalContributions: 245,
          weeks: [],
        },
      };

      const svg = renderStreakCard(mockStreak, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('12'); // Current streak
      expect(svg).toContain('25'); // Longest streak
      expect(svg).toContain('245'); // Total contributions
    });
  });

  describe('renderRepositoryCard', () => {
    it('should generate a valid repository card SVG', () => {
      const mockRepo = {
        name: 'git-profile-stats',
        owner: { login: 'john_doe' },
        description: 'Mock repository description text for checking.',
        language: 'TypeScript',
        stargazers_count: 99,
        forks_count: 14,
        license: { name: 'MIT License', spdx_id: 'MIT' },
        updated_at: '2026-08-01T00:00:00Z',
      };

      const svg = renderRepositoryCard(mockRepo, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('git-profile-stats');
      expect(svg).toContain('Mock repository description');
      expect(svg).toContain('TypeScript');
      expect(svg).toContain('99');
    });
  });
});
