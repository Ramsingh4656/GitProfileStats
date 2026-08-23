import type { Pool } from 'pg';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from '../../../domain/entities/User.js';
import { PostgresUserRepository } from './PostgresUserRepository.js';

describe('PostgresUserRepository', () => {
  const query = vi.fn();
  let repository: PostgresUserRepository;

  const user = User.create({
    id: 'user-1',
    githubId: 'github-1',
    username: 'octocat',
    email: 'octocat@example.com',
    avatarUrl: 'https://example.com/avatar.png',
    tier: 'FREE',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    settings: {
      preferredTheme: 'dark',
      defaultCardStyle: 'classic',
      languageSorting: 'size',
      defaultCardVisibility: {
        profile: true,
        stats: true,
        languages: true,
        streak: true,
      },
    },
    githubAccessToken: 'initial-token',
  });

  const row = {
    id: 'user-1',
    github_id: 'github-1',
    username: 'octocat',
    email: 'octocat@example.com',
    avatar_url: 'https://example.com/avatar.png',
    tier: 'FREE' as const,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
    settings: user.settings,
    github_access_token: 'initial-token',
  };

  beforeEach(() => {
    query.mockReset();
    repository = new PostgresUserRepository({ query } as unknown as Pool);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a user with the GitHub token in a parameterized upsert', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    await repository.save(user);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      expect.arrayContaining(['user-1', 'github-1', 'initial-token']),
    );
    expect(query.mock.calls[0][0]).toContain('github_access_token');
    expect(query.mock.calls[0][0]).toContain('ON CONFLICT (id) DO UPDATE');
  });

  it('reads a persisted user and preserves the GitHub token without serializing it', async () => {
    query.mockResolvedValueOnce({ rows: [row] });

    const loaded = await repository.findById('user-1');

    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['user-1']);
    expect(loaded?.username).toBe('octocat');
    expect(loaded?.githubAccessToken).toBe('initial-token');
    expect(loaded?.toJSON()).not.toHaveProperty('githubAccessToken');
  });

  it('reads users by case-insensitive username and persists token updates', async () => {
    query.mockResolvedValueOnce({ rows: [row] });
    const loaded = await repository.findByUsername('OctoCat');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('LOWER(username) = LOWER($1)'), [
      'OctoCat',
    ]);

    loaded?.updateGithubAccessToken('updated-token');
    query.mockResolvedValueOnce({ rows: [] });
    await repository.save(loaded as User);

    expect(query.mock.calls[1][1]).toEqual(
      expect.arrayContaining(['user-1', 'github-1', 'updated-token']),
    );
  });
});
