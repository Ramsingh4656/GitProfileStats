import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';
import { UserNotFoundError } from '../../../domain/errors/DomainError.js';
import { IUserProfileResponse } from '../../dtos/UserProfileDTO.js';

@injectable()
export class GetUserProfileUseCase {
  constructor(
    @inject('IUserRepository')
    private readonly userRepository: IUserRepository
  ) {}

  public async execute(userId: string): Promise<IUserProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const raw = user.toJSON();
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      avatarUrl: raw.avatarUrl,
      tier: raw.tier,
      createdAt: raw.createdAt.toISOString(),
    };
  }
}
