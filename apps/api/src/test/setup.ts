import 'reflect-metadata';
import { beforeEach } from 'vitest';
import { clearResponseCache } from '../infrastructure/http/middleware/cacheMiddleware.js';
import { clearAvatarCache } from '../utils/image.js';
import { clearTextWidthCache } from '../cards/engine/typography.js';
import { clearAttributeNameCache } from '../cards/engine/helpers.js';

// Configure test environment variables to satisfy Zod schema validations
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.WEB_BASE_URL = 'http://localhost:3000';
process.env.LOG_LEVEL = 'silent';
process.env.GITHUB_CLIENT_ID = 'dummy_client_id';
process.env.GITHUB_CLIENT_SECRET = 'dummy_client_secret';
process.env.GITHUB_CALLBACK_URL = 'http://localhost:4000/api/v1/auth/github/callback';
process.env.GITHUB_TOKEN = 'dummy_token';

beforeEach(() => {
  clearResponseCache();
  clearAvatarCache();
  clearTextWidthCache();
  clearAttributeNameCache();
});
