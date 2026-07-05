import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.getSummary(req.user!);
      res.json({ data: summary });
    } catch (error) {
      next(error);
    }
  },
};
