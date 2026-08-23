import { inject, injectable } from 'tsyringe';
import type { Pool } from 'pg';
import { User } from '../../../domain/entities/User.js';
import type { IUserSettings } from '../../../domain/entities/User.js';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';

type UserRow = {
  id: string;
  github_id: string;
  username: string;
  email: string | null;
  avatar_url: string;
  tier: 'FREE' | 'PRO';
  created_at: Date | string;
  updated_at: Date | string;
  settings: IUserSettings | null;
  github_access_token: string | null;
};

const USER_COLUMNS = `
  id,
  github_id,
  username,
  email,
  avatar_url,
  tier,
  created_at,
  updated_at,
  settings,
  github_access_token
`;

@injectable()
export class PostgresUserRepository implements IUserRepository {
  constructor(@inject('DatabasePool') private readonly pool: Pool) {}

  public async findById(id: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0] ? this.toUser(result.rows[0]) : null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE LOWER(username) = LOWER($1)`,
      [username],
    );
    return result.rows[0] ? this.toUser(result.rows[0]) : null;
  }

  public async save(user: User): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO users (
          id,
          github_id,
          username,
          email,
          avatar_url,
          tier,
          created_at,
          updated_at,
          settings,
          github_access_token
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
        ON CONFLICT (id) DO UPDATE SET
          github_id = EXCLUDED.github_id,
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          avatar_url = EXCLUDED.avatar_url,
          tier = EXCLUDED.tier,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at,
          settings = EXCLUDED.settings,
          github_access_token = EXCLUDED.github_access_token
      `,
      [
        user.id,
        user.githubId,
        user.username,
        user.email,
        user.avatarUrl,
        user.tier,
        user.createdAt,
        user.updatedAt,
        JSON.stringify(user.settings),
        user.githubAccessToken ?? null,
      ],
    );
  }

  public async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  private toUser(row: UserRow): User {
    return User.create({
      id: row.id,
      githubId: row.github_id,
      username: row.username,
      email: row.email,
      avatarUrl: row.avatar_url,
      tier: row.tier,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      settings: row.settings ?? undefined,
      githubAccessToken: row.github_access_token ?? undefined,
    });
  }
}
