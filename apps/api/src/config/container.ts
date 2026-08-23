import { container } from 'tsyringe';
import { InMemoryUserRepository } from '../infrastructure/persistence/repositories/InMemoryUserRepository.js';
import { SessionService } from '../application/services/SessionService.js';

// Register dependency interfaces to concrete adapters
container.registerSingleton('IUserRepository', InMemoryUserRepository);
container.registerSingleton(SessionService, SessionService);

export { container };
