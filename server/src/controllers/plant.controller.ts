import { Request, Response, NextFunction } from 'express';
import { plantService } from '../services/plant.service';
import { createPlantSchema, updatePlantSchema, listPlantQuerySchema } from '../schemas/plant.schema';
import { UnauthorizedError } from '../middleware/errorHandler';
import type { AuthenticatedUser } from '../types/express';

function requireUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError('인증이 필요합니다');
  }
  return req.user;
}

export const plantController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listPlantQuerySchema.parse(req.query);
      const { items, meta } = await plantService.list(query, requireUser(req));
      res.json({ data: items, meta });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const plant = await plantService.getById(String(req.params.id), requireUser(req));
      res.json({ data: plant });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPlantSchema.parse(req.body);
      const plant = await plantService.create(data, requireUser(req));
      res.status(201).json({ data: plant });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updatePlantSchema.parse(req.body);
      const plant = await plantService.update(String(req.params.id), data, requireUser(req));
      res.json({ data: plant });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await plantService.remove(String(req.params.id), requireUser(req));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
