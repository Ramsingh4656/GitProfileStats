import { injectable } from 'tsyringe';
import { User } from '../../../domain/entities/User.js';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';

@injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();
  private readonly usernameToId = new Map<string, string>();

  public findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  public findByUsername(username: string): Promise<User | null> {
    const id = this.usernameToId.get(username.toLowerCase());
    if (!id) {
      return Promise.resolve(null);
    }
    return Promise.resolve(this.users.get(id) ?? null);
  }

  public save(user: User): Promise<void> {
    const existing = this.users.get(user.id);
    if (existing) {
      this.usernameToId.delete(existing.username.toLowerCase());
    }
    this.users.set(user.id, user);
    this.usernameToId.set(user.username.toLowerCase(), user.id);
    return Promise.resolve();
  }

  public delete(id: string): Promise<void> {
    const existing = this.users.get(id);
    if (existing) {
      this.usernameToId.delete(existing.username.toLowerCase());
    }
    this.users.delete(id);
    return Promise.resolve();
  }
}
