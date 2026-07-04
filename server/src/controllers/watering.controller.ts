import { Request, Response, NextFunction } from 'express';
import { wateringService } from '../services/watering.service';
import { createWateringSchema } from '../schemas/plant.schema';

export const wateringController = {
  async getByPlantId(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await wateringService.findByPlantId(String(req.params.plantId));
      res.json(records);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createWateringSchema.parse(req.body);
      const record = await wateringService.create(data);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  },
};
