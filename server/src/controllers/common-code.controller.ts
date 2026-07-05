import { Request, Response, NextFunction } from 'express';
import { commonCodeService } from '../services/common-code.service';
import { listCommonCodeQuerySchema } from '../schemas/common-code.schema';

export const commonCodeController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listCommonCodeQuerySchema.parse(req.query);
      const items = await commonCodeService.list(query.groupCode);
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  },
};
