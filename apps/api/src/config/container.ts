import { container } from 'tsyringe';
import { InMemoryUserRepository } from '../infrastructure/persistence/repositories/InMemoryUserRepository.js';

// Register dependency interfaces to concrete adapters
container.registerSingleton('IUserRepository', InMemoryUserRepository);

export { container };
