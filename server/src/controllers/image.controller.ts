import { Request, Response, NextFunction } from 'express';
import { imageService } from '../services/image.service';
import { listPlantImagesQuerySchema, recentImagesQuerySchema, listImagesQuerySchema, createPlantImageSchema, updateImageSchema } from '../schemas/image.schema';
import { UnauthorizedError } from '../middleware/errorHandler';
import type { AuthenticatedUser } from '../types/express';

function requireUser(req: Request): AuthenticatedUser {
  if (!req.user) throw new UnauthorizedError('인증이 필요합니다');
  return req.user;
}

export const imageController = {
  async getByPlantId(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listPlantImagesQuerySchema.parse(req.query);
      const result = await imageService.listByPlantId(String(req.params.id), query, requireUser(req));
      res.json({ data: result.items, meta: result.meta });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listImagesQuerySchema.parse(req.query);
      const result = await imageService.list(query, requireUser(req));
      res.json({ data: result.items, meta: result.meta });
    } catch (error) {
      next(error);
    }
  },

  async getRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const query = recentImagesQuerySchema.parse(req.query);
      const items = await imageService.listRecent(query, requireUser(req));
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  },

  async createByPlantId(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPlantImageSchema.parse(req.body);
      const item = await imageService.createByPlantId(String(req.params.id), data, requireUser(req));
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateImageSchema.parse(req.body);
      const item = await imageService.update(String(req.params.id), data, requireUser(req));
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await imageService.remove(String(req.params.id), requireUser(req));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
