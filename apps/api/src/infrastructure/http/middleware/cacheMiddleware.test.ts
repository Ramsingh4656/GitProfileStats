import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../../config/logger.js';
import { cacheMiddleware, clearResponseCache } from './cacheMiddleware.js';

describe('cacheMiddleware', () => {
  beforeEach(() => {
    clearResponseCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not include a raw token in cache keys or cache-hit logs', () => {
    const rawToken = 'cache-token-must-not-appear';
    const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => undefined);
    const middleware = cacheMiddleware();
    const request = {
      method: 'GET',
      path: '/api/stats',
      query: { username: 'demo', token: rawToken },
      user: { id: 'verified-user-id' },
    } as unknown as Request;
    const next = vi.fn();
    const makeResponse = (): Response =>
      ({
        statusCode: 200,
        getHeader: vi.fn().mockReturnValue(undefined),
        setHeader: vi.fn(),
        status: vi.fn(function (this: Response) {
          return this;
        }),
        send: vi.fn(function (this: Response) {
          return this;
        }),
      }) as unknown as Response;

    const firstResponse = makeResponse();
    middleware(request, firstResponse, next);
    firstResponse.send('cached body');

    const secondResponse = makeResponse();
    middleware(request, secondResponse, next);

    expect(secondResponse.send).toHaveBeenCalledWith('cached body');
    expect(debugSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        cacheKey: expect.stringContaining('user=verified-user-id'),
      }),
      'Serving endpoint response from cache',
    );
    expect(JSON.stringify(debugSpy.mock.calls)).not.toContain(rawToken);
  });
});
