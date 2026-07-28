import type { Request, Response } from 'express';
import { injectable } from 'tsyringe';

@injectable()
export class HealthController {
  public check = (_req: Request, res: Response): void => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  };
}
