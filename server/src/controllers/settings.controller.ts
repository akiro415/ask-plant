import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';
import { updateSettingsSchema } from '../schemas/settings.schema';

export const settingsController = {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.get();
      res.json({ data: settings });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateSettingsSchema.parse(req.body);
      const settings = await settingsService.update(input);
      res.json({ data: settings });
    } catch (error) {
      next(error);
    }
  },
};
