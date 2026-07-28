import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetUserProfileUseCase } from '../../../application/use-cases/user/GetUserProfileUseCase.js';

interface IAuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

@injectable()
export class UserController {
  constructor(
    @inject(GetUserProfileUseCase)
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
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
}
