import { Request, Response, NextFunction } from 'express';
import { collectorProfileService } from '../services/collector-profile.service';
import { updateCollectorProfileSchema } from '../schemas/collector-profile.schema';

export const collectorProfileController = {
  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await collectorProfileService.getMine(req.user!);
      res.json({ data: profile });
    } catch (error) {
      next(error);
    }
  },

  async upsertMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateCollectorProfileSchema.parse(req.body);
      const profile = await collectorProfileService.upsertMine(req.user!, data);
      res.json({ data: profile });
    } catch (error) {
      next(error);
    }
  },
};
