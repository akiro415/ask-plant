import { Request, Response, NextFunction } from 'express';
import { publicService } from '../services/public.service';
import { listPublicPlantsQuerySchema } from '../schemas/public.schema';

export const publicController = {
  async listPlants(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listPublicPlantsQuerySchema.parse(req.query);
      const result = await publicService.list(query);
      res.json({ data: result.items, meta: result.meta });
    } catch (error) {
      next(error);
    }
  },

  async getPlantByQrCode(req: Request, res: Response, next: NextFunction) {
    try {
      const plant = await publicService.getByQrCode(String(req.params.qrCode));
      res.json({ data: plant });
    } catch (error) {
      next(error);
    }
  },
};
