import { describe, it, expect } from 'vitest';
import {
  renderProfileCard,
  renderStatsCard,
  renderLanguagesCard,
  renderStreakCard,
  renderRepositoryCard,
  renderTrophiesCard,
  calculateTrophy,
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
      expect(svg).toContain('12'); // Followers
    });

    it('should show private repository count correctly when stats are provided', async () => {
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
      const mockStats = { publicRepositories: 5, privateRepositories: 7 };

      const svg = await renderProfileCard(mockUser, mockStats, dummyOptions);
      expect(svg).toContain('5'); // Public repos
      expect(svg).toContain('7'); // Private repos
      expect(svg).toContain('Public Repos');
      expect(svg).toContain('Private Repos');
    });

    it('should render distinct colors for different themes', async () => {
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

      const lightSvg = await renderProfileCard(mockUser, { theme: 'light' });
      const darkSvg = await renderProfileCard(mockUser, { theme: 'dark' });
      const draculaSvg = await renderProfileCard(mockUser, { theme: 'dracula' });

      // Light background is #ffffff
      expect(lightSvg).toContain('#ffffff');
      // Dark background is #0d1117
      expect(darkSvg).toContain('#0d1117');
      // Dracula background is #282a36
      expect(draculaSvg).toContain('#282a36');

      expect(lightSvg).not.toEqual(darkSvg);
      expect(darkSvg).not.toEqual(draculaSvg);
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
      expect(svg).toContain('width="490"');
      expect(svg).toContain('height="195"');
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
      expect(svg).toContain('width="490"');
      expect(svg).toContain('height="195"');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('TypeScript');
      expect(svg).toContain('JavaScript');
      expect(svg).toContain('80.0%');
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

  describe('renderTrophiesCard', () => {
    it('should calculate trophy tiers correctly', () => {
      expect(calculateTrophy('stars', 5)).toEqual({ tier: 'NONE', tierName: 'Beginner', color: '#8b949e' });
      expect(calculateTrophy('stars', 10)).toEqual({ tier: 'BRONZE', tierName: 'Bronze', color: '#c5a059' });
      expect(calculateTrophy('stars', 50)).toEqual({ tier: 'SILVER', tierName: 'Silver', color: '#a6a6a6' });
      expect(calculateTrophy('stars', 200)).toEqual({ tier: 'GOLD', tierName: 'Gold', color: '#ffd700' });
      expect(calculateTrophy('stars', 1000)).toEqual({ tier: 'PLATINUM', tierName: 'Platinum', color: '#00e5ff' });

      expect(calculateTrophy('commits', 50)).toEqual({ tier: 'NONE', tierName: 'Beginner', color: '#8b949e' });
      expect(calculateTrophy('commits', 100)).toEqual({ tier: 'BRONZE', tierName: 'Bronze', color: '#c5a059' });
      expect(calculateTrophy('commits', 500)).toEqual({ tier: 'SILVER', tierName: 'Silver', color: '#a6a6a6' });
      expect(calculateTrophy('commits', 2000)).toEqual({ tier: 'GOLD', tierName: 'Gold', color: '#ffd700' });
      expect(calculateTrophy('commits', 10000)).toEqual({ tier: 'PLATINUM', tierName: 'Platinum', color: '#00e5ff' });
    });

    it('should generate a valid trophies card SVG', () => {
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

      const svg = renderTrophiesCard(mockStats, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('width="490"');
      expect(svg).toContain('height="195"');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('John Doe');
      expect(svg).toContain('Stars');
      expect(svg).toContain('Commits');
      expect(svg).toContain('PRs');
      expect(svg).toContain('Issues');
      expect(svg).toContain('Followers');
      expect(svg).toContain('Repos');
    });
  });
});
