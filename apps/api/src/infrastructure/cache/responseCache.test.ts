import type { Redis } from '@upstash/redis';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InMemoryResponseCache } from './InMemoryResponseCache.js';
import { UpstashResponseCache } from './UpstashResponseCache.js';

describe('UpstashResponseCache', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets cached values and stores them with a native Redis TTL', async () => {
    const redis = {
      get: vi.fn().mockResolvedValue({ result: 'cached' }),
      set: vi.fn().mockResolvedValue('OK'),
    } as unknown as Redis;
    const cache = new UpstashResponseCache(redis);

    await cache.set('github-key', { result: 'fresh' }, 1500);
    const value = await cache.get<{ result: string }>('github-key');

    expect(redis.set).toHaveBeenCalledWith('github-key', { result: 'fresh' }, { ex: 2 });
    expect(redis.get).toHaveBeenCalledWith('github-key');
    expect(value).toEqual({ result: 'cached' });
  });

  it('normalizes a Redis expiration miss to undefined', async () => {
    const redis = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn(),
    } as unknown as Redis;
    const cache = new UpstashResponseCache(redis);

    await expect(cache.get('expired-key')).resolves.toBeUndefined();
  });
});

describe('InMemoryResponseCache fallback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('expires entries locally when Redis configuration is absent', async () => {
    vi.useFakeTimers();
    const cache = new InMemoryResponseCache();

    await cache.set('local-key', { result: 'cached' }, 1000);
    await expect(cache.get('local-key')).resolves.toEqual({ result: 'cached' });

    vi.advanceTimersByTime(1001);
    await expect(cache.get('local-key')).resolves.toBeUndefined();
  });
});
