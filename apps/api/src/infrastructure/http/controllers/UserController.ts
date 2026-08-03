import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetUserProfileUseCase } from '../../../application/use-cases/user/GetUserProfileUseCase.js';
import { UpdateUserSettingsUseCase } from '../../../application/use-cases/user/UpdateUserSettingsUseCase.js';
import type { IUserSettings } from '../../../domain/entities/User.js';

import type { IAuthenticatedRequest } from '../middleware/authGuard.js';

@injectable()
export class UserController {
  constructor(
    @inject(GetUserProfileUseCase)
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    @inject(UpdateUserSettingsUseCase)
    private readonly updateUserSettingsUseCase: UpdateUserSettingsUseCase,
  ) {}

  public getUserProfile = (req: Request, res: Response, next: NextFunction): void => {
    const userId = (req as IAuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    this.getUserProfileUseCase
      .execute(userId)
      .then((profile) => {
        res.status(200).json({ success: true, data: profile });
      })
      .catch(next);
  };

  public updateUserSettings = (req: Request, res: Response, next: NextFunction): void => {
    const userId = (req as IAuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    this.updateUserSettingsUseCase
      .execute(userId, req.body as Partial<IUserSettings>)
      .then((profile) => {
        res.status(200).json({ success: true, data: profile });
      })
      .catch(next);
  };
}
