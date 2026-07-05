import { Request, Response, NextFunction } from 'express';
import { historyService } from '../services/history.service';
import { listPlantHistoriesQuerySchema, recentHistoriesQuerySchema, createPlantHistorySchema, updateHistorySchema } from '../schemas/history.schema';
import { UnauthorizedError } from '../middleware/errorHandler';
import type { AuthenticatedUser } from '../types/express';

function requireUser(req: Request): AuthenticatedUser {
  if (!req.user) throw new UnauthorizedError('인증이 필요합니다');
  return req.user;
}

export const historyController = {
  async getByPlantId(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listPlantHistoriesQuerySchema.parse(req.query);
      const result = await historyService.listByPlantId(String(req.params.id), query, requireUser(req));
      res.json({ data: result.items, meta: result.meta });
    } catch (error) {
      next(error);
    }
  },

  async getRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const query = recentHistoriesQuerySchema.parse(req.query);
      const items = await historyService.listRecent(query, requireUser(req));
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  },

  async createByPlantId(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPlantHistorySchema.parse(req.body);
      const item = await historyService.createByPlantId(String(req.params.id), data, requireUser(req));
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateHistorySchema.parse(req.body);
      const item = await historyService.update(String(req.params.id), data, requireUser(req));
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await historyService.remove(String(req.params.id), requireUser(req));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
