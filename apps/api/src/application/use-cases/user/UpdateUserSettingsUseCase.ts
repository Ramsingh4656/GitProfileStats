import { injectable, inject } from 'tsyringe';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';
import { UserNotFoundError } from '../../../domain/errors/DomainError.js';
import type { IUserSettings } from '../../../domain/entities/User.js';
import type { IUserProfileResponse } from '../../dtos/UserProfileDTO.js';

@injectable()
export class UpdateUserSettingsUseCase {
  constructor(
    @inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  public async execute(userId: string, settings: Partial<IUserSettings>): Promise<IUserProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    user.updateSettings(settings);
    await this.userRepository.save(user);

    const raw = user.toJSON();
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      avatarUrl: raw.avatarUrl,
      tier: raw.tier,
      createdAt: raw.createdAt.toISOString(),
      settings: user.settings,
      hasGithubToken: user.hasGithubAccessToken,
    };
  }
}
