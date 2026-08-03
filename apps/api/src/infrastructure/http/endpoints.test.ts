import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';

describe('API Endpoints', () => {
  const mockFetch = vi.fn(async (url: string, options?: any) => {
    const urlString = String(url);
    
    // 1. GraphQL Mocking
    if (urlString.includes('/graphql')) {
      const body = JSON.parse(options?.body || '{}');
      const query = body.query || '';
      
      if (query.includes('viewer { login') || query.includes('viewer{login')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              viewer: {
                login: 'demo',
                createdAt: '2026-01-01T00:00:00Z',
              },
            },
          }),
        };
      }
      if (query.includes('thisYear: contributionsCollection')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                thisYear: { totalCommitContributions: 100, restrictedContributionsCount: 10 },
                thisMonth: { totalCommitContributions: 20, restrictedContributionsCount: 2 },
                thisWeek: { totalCommitContributions: 5, restrictedContributionsCount: 1 },
                year_2026: { totalCommitContributions: 100, restrictedContributionsCount: 10 },
              },
            },
          }),
        };
      }
      if (query.includes('standardCalendar: contributionsCollection')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                standardCalendar: {
                  contributionCalendar: {
                    totalContributions: 150,
                    weeks: [],
                  },
                },
                year_2026: {
                  contributionCalendar: {
                    totalContributions: 150,
                    weeks: [],
                  },
                },
              },
            },
          }),
        };
      }
      if (query.includes('pullRequests(states: [OPEN])') || query.includes('pullRequests {')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                pullRequests: { totalCount: 42 },
                openPRs: { totalCount: 10 },
                closedPRs: { totalCount: 20 },
                mergedPRs: { totalCount: 12 },
              },
            },
          }),
        };
      }
      if (query.includes('allIssues: issues {') || query.includes('allIssues: issues(')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                allIssues: { totalCount: 24 },
                closedIssues: { totalCount: 1 },
              },
            },
          }),
        };
      }
      if (query.includes('closedIssuesList: issues(')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                closedIssuesList: {
                  pageInfo: { hasNextPage: false, endCursor: null },
                  nodes: [
                    { createdAt: '2026-07-28T00:00:00Z', closedAt: '2026-07-29T00:00:00Z' },
                  ],
                },
              },
            },
          }),
        };
      }
      if (query.includes('user(login: $login)')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                login: 'demo',
                createdAt: '2026-01-01T00:00:00Z',
              },
            },
          }),
        };
      }
    }

    // 2. REST Mocking
    if (urlString.includes('/users/demo/repos') || urlString.includes('/user/repos')) {
      return {
        ok: true,
        json: async () => [
          { stargazers_count: 5, forks_count: 2, watchers_count: 5, open_issues_count: 1, size: 100, fork: false },
        ],
      };
    }
    if (urlString.includes('/oauth/access_token')) {
      return {
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
        }),
      };
    }
    if (urlString.includes('/users/demo') || urlString.includes('/user')) {
      return {
        ok: true,
        json: async () => ({
          id: 5832347,
          login: 'demo',
          name: 'Demo User',
          followers: 10,
          following: 5,
          public_repos: 2,
          total_private_repos: 1,
          avatar_url: 'https://avatars.githubusercontent.com/u/5832347?v=4',
        }),
      };
    }
    if (urlString.includes('/repos/demo/test/languages')) {
      return {
        ok: true,
        json: async () => ({ TypeScript: 1000, JavaScript: 500 }),
      };
    }
    if (urlString.includes('/repos/demo/test')) {
      return {
        ok: true,
        json: async () => ({
          name: 'test',
          owner: { login: 'demo' },
          description: 'Mock repository description',
          language: 'TypeScript',
          stargazers_count: 99,
          forks_count: 14,
          license: { name: 'MIT License', spdx_id: 'MIT' },
          updated_at: '2026-08-01T00:00:00Z',
        }),
      };
    }

    // Fallback for avatar base64 fetch
    return {
      ok: true,
      text: async () => 'mock-base64',
      arrayBuffer: async () => new ArrayBuffer(0),
      json: async () => ({}),
    };
  });

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 OK and health statistics', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Validation Middleware', () => {
    it('should return 400 Bad Request if neither username nor token is provided', async () => {
      const response = await request(app).get('/api/stats');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should pass validation if at least username is provided', async () => {
      const response = await request(app).get('/api/stats?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GitHub Controller Endpoints', () => {
    it('should retrieve statistics successfully in mock/demo mode', async () => {
      const response = await request(app).get('/api/statistics?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('repositoryStats');
      expect(response.body.data).toHaveProperty('contributionStats');
    });

    it('should retrieve repository list successfully', async () => {
      const response = await request(app).get('/api/repositories?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data).toHaveProperty('rankings');
    });

    it('should retrieve language breakdown successfully', async () => {
      const response = await request(app).get('/api/languages?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should retrieve contributions data successfully', async () => {
      const response = await request(app).get('/api/contributions?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('longestStreak');
    });

    it('should retrieve commits data successfully', async () => {
      const response = await request(app).get('/api/commits?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCommits');
    });

    it('should retrieve pull requests count successfully', async () => {
      const response = await request(app).get('/api/pull-requests?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPullRequests');
    });

    it('should retrieve issues count successfully', async () => {
      const response = await request(app).get('/api/issues?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalIssuesOpened');
    });
  });

  describe('Card Controller Endpoints (SVG generation)', () => {
    it('should generate profile card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/profile.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate stats card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/stats.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate languages card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/languages.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate streak card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/streak.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate repository card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/repository.svg?owner=demo&repo=test')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });
  });

  describe('User and Authentication Routes', () => {
    it('should return 401 Unauthorized for /users/me without token', async () => {
      const response = await request(app).get('/api/v1/users/me');
      expect(response.status).toBe(401);
    });

    it('should pass simulation authentication with authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer some-test-id');
      
      expect(response.status).toBe(404);
      expect(response.body.error.message).toContain('not found');
    });

    it('should redirect to GitHub authorize URL for login', async () => {
      const response = await request(app).get('/api/v1/auth/github');
      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('github.com/login/oauth/authorize');
    });

    it('should redirect with missing_code error when callback is missing code', async () => {
      const response = await request(app).get('/api/v1/auth/github/callback');
      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('error=missing_code');
    });

    it('should handle oauth callback with code and redirect to frontend callback with token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({ code: 'some-oauth-code' });
      
      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('token=5832347');

      // Now query /users/me with the token and expect it to succeed
      const profileResponse = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer 5832347');
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.username).toBe('demo');
    });
  });
});
