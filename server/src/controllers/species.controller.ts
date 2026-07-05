import { Request, Response, NextFunction } from 'express';
import { speciesService } from '../services/species.service';

export const speciesController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = await speciesService.list();
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  },
};
