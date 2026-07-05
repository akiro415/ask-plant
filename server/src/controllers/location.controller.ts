import { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/location.service';
import { createLocationSchema, updateLocationSchema, listLocationQuerySchema } from '../schemas/location.schema';

export const locationController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listLocationQuerySchema.parse(req.query);
      const items = await locationService.list(query, req.user!);
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.getById(String(req.params.id), req.user!);
      res.json({ data: location });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createLocationSchema.parse(req.body);
      const location = await locationService.create(data, req.user!);
      res.status(201).json({ data: location });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateLocationSchema.parse(req.body);
      const location = await locationService.update(String(req.params.id), data, req.user!);
      res.json({ data: location });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await locationService.remove(String(req.params.id), req.user!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
