import { Request, Response, NextFunction } from 'express';
import { commonCodeService } from '../services/common-code.service';
import {
  createCommonCodeSchema,
  listCommonCodeQuerySchema,
  updateCommonCodeSchema,
} from '../schemas/common-code.schema';

export const commonCodeController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listCommonCodeQuerySchema.parse(req.query);
      const items = await commonCodeService.list(query.groupCode, query.includeInactive);
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await commonCodeService.getById(String(req.params.id));
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createCommonCodeSchema.parse(req.body);
      const item = await commonCodeService.create(input);
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateCommonCodeSchema.parse(req.body);
      const item = await commonCodeService.update(String(req.params.id), input);
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await commonCodeService.remove(String(req.params.id));
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  },
};
