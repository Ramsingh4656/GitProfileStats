import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';

describe('API Endpoints', () => {
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
      // Centralized error handler outputs error details
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
      expect(response.text).toContain('<svg');
      expect(response.text).toContain('</svg>');
    });

    it('should generate stats card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/stats.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      expect(response.text).toContain('<svg');
      expect(response.text).toContain('</svg>');
    });

    it('should generate languages card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/languages.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      expect(response.text).toContain('<svg');
      expect(response.text).toContain('</svg>');
    });

    it('should generate streak card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/streak.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      expect(response.text).toContain('<svg');
      expect(response.text).toContain('</svg>');
    });

    it('should generate repository card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/repository.svg?owner=demo&repo=test')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      expect(response.text).toContain('<svg');
      expect(response.text).toContain('</svg>');
    });
  });

  describe('User and Authentication Routes', () => {
    it('should return 401 Unauthorized for /users/me without token', async () => {
      const response = await request(app).get('/api/v1/users/me');
      expect(response.status).toBe(401);
    });

    it('should pass simulation authentication with authorization header', async () => {
      // In the volatile InMemoryUserRepository, if the user doesn't exist, it returns 404
      // But we pass authentication (authGuard) successfully and hit the UserController logic.
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer some-test-id');
      
      // authGuard sets req.user = { id: 'some-test-id' }.
      // UserController executes GetUserProfileUseCase, which queries the InMemoryUserRepository, which is empty, throwing 404.
      // So status should be 404.
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('User not found');
    });
  });
});
