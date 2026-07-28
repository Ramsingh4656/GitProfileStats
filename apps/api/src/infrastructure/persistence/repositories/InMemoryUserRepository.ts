import { injectable } from 'tsyringe';
import { User } from '../../../domain/entities/User.js';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';

@injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

  public findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  public findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  public save(user: User): Promise<void> {
    this.users.set(user.id, user);
    return Promise.resolve();
  }

  public delete(id: string): Promise<void> {
    this.users.delete(id);
    return Promise.resolve();
  }
}
