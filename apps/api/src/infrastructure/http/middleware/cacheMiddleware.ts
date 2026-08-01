import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../../config/logger.js';

interface CacheEntry {
  body: any;
  headers: Record<string, string | string[] | undefined>;
  statusCode: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 1000;

// Cleanup expired items every 60 seconds
const interval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt < now) {
      cache.delete(key);
    }
  }
}, 60000);

if (typeof interval.unref === 'function') {
  interval.unref();
}

/**
 * Clear the in-memory response cache. Useful for test suites.
 */
export const clearResponseCache = (): void => {
  cache.clear();
};

export const cacheMiddleware = (ttlSeconds = 300) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Create a deterministic cache key from path, sorted query parameters, and token
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map((key) => `${key}=${String(req.query[key])}`)
      .join('&');

    const token = (req.query.token as string) || (req.headers['x-github-token'] as string) || '';
    const cacheKey = `${req.path}?${sortedQuery}&token=${token}`;

    const now = Date.now();
    const cached = cache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      logger.debug({ cacheKey }, 'Serving endpoint response from cache');
      
      // Set cached headers
      Object.entries(cached.headers).forEach(([name, value]) => {
        if (value !== undefined) {
          res.setHeader(name, value);
        }
      });
      
      res.status(cached.statusCode).send(cached.body);
      return;
    }

    // Intercept res.send
    const originalSend = res.send;
    res.send = function (body: any): Response {
      res.send = originalSend;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Enforce cache size limit
        if (cache.size >= MAX_CACHE_SIZE) {
          const firstKey = cache.keys().next().value;
          if (firstKey !== undefined) {
            cache.delete(firstKey);
          }
        }

        const headers: Record<string, string | string[] | undefined> = {};
        const contentType = res.getHeader('content-type');
        if (contentType !== undefined) {
          headers['content-type'] = contentType;
        }
        const cacheControl = res.getHeader('cache-control');
        if (cacheControl !== undefined) {
          headers['cache-control'] = cacheControl;
        }

        cache.set(cacheKey, {
          body,
          headers,
          statusCode: res.statusCode,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
};
