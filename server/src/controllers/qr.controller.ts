import { Request, Response, NextFunction } from 'express';
import { qrService } from '../services/qr.service';
import { listQrQuerySchema } from '../schemas/qr.schema';
import { UnauthorizedError } from '../middleware/errorHandler';
import type { AuthenticatedUser } from '../types/express';

function requireUser(req: Request): AuthenticatedUser {
  if (!req.user) throw new UnauthorizedError('인증이 필요합니다');
  return req.user;
}

export const qrController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listQrQuerySchema.parse(req.query);
      const items = await qrService.list(query, requireUser(req));
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  },

  async preview(req: Request, res: Response, next: NextFunction) {
    try {
      const preview = await qrService.preview(String(req.params.plantId), requireUser(req));
      res.json({ data: preview });
    } catch (error) {
      next(error);
    }
  },
};
