import { Request, Response, NextFunction } from 'express';
import { publicService } from '../services/public.service';

export const publicController = {
  async getPlantByQrCode(req: Request, res: Response, next: NextFunction) {
    try {
      const plant = await publicService.getByQrCode(String(req.params.qrCode));
      res.json({ data: plant });
    } catch (error) {
      next(error);
    }
  },
};
