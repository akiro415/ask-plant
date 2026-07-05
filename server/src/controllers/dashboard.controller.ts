import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
  async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.getSummary();
      res.json({ data: summary });
    } catch (error) {
      next(error);
    }
  },
};
