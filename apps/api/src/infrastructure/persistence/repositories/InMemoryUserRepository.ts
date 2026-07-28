import { injectable } from 'tsyringe';
import { User } from '../../../domain/entities/User.js';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';

@injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

  public async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  public async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
