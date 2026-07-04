import { Request, Response, NextFunction } from 'express';
import { plantService } from '../services/plant.service';
import { createPlantSchema, updatePlantSchema } from '../schemas/plant.schema';
import { AppError } from '../middleware/errorHandler';

export const plantController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const plants = await plantService.findAll();
      res.json(plants);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const plant = await plantService.findById(String(req.params.id));
      if (!plant) {
        throw new AppError(404, '식물을 찾을 수 없습니다');
      }
      res.json(plant);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPlantSchema.parse(req.body);
      const plant = await plantService.create(data);
      res.status(201).json(plant);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updatePlantSchema.parse(req.body);
      const plant = await plantService.update(String(req.params.id), data);
      res.json(plant);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await plantService.delete(String(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
