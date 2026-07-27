import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetUserProfileUseCase } from '../../../application/use-cases/user/GetUserProfileUseCase.js';

@injectable()
export class UserController {
  constructor(
    @inject(GetUserProfileUseCase)
    private readonly getUserProfileUseCase: GetUserProfileUseCase
  ) {}

  public getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const profile = await this.getUserProfileUseCase.execute(userId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  };
}
