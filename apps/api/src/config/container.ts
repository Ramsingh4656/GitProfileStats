import { Redis } from '@upstash/redis';
import { Pool } from 'pg';
import { container } from 'tsyringe';
import { env } from './env.js';
import { InMemoryUserRepository } from '../infrastructure/persistence/repositories/InMemoryUserRepository.js';
import { PostgresUserRepository } from '../infrastructure/persistence/repositories/PostgresUserRepository.js';
import { InMemoryResponseCache } from '../infrastructure/cache/InMemoryResponseCache.js';
import { UpstashResponseCache } from '../infrastructure/cache/UpstashResponseCache.js';
import { SessionService } from '../application/services/SessionService.js';

// Register dependency interfaces to concrete adapters.
if (env.DATABASE_URL) {
  container.registerInstance(
    'DatabasePool',
    new Pool({
      connectionString: env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }),
  );
  container.registerSingleton('IUserRepository', PostgresUserRepository);
} else {
  container.registerSingleton('IUserRepository', InMemoryUserRepository);
}

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  container.registerInstance(
    'UpstashRedis',
    new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
  );
  container.registerSingleton('ResponseCache', UpstashResponseCache);
} else {
  container.registerSingleton('ResponseCache', InMemoryResponseCache);
}

container.registerSingleton(SessionService, SessionService);

export { container };
