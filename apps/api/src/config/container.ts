import { Pool } from 'pg';
import { container } from 'tsyringe';
import { env } from './env.js';
import { InMemoryUserRepository } from '../infrastructure/persistence/repositories/InMemoryUserRepository.js';
import { PostgresUserRepository } from '../infrastructure/persistence/repositories/PostgresUserRepository.js';
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
container.registerSingleton(SessionService, SessionService);

export { container };
