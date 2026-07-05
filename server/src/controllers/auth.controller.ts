import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema, updateMeSchema } from '../schemas/auth.schema';
import { UnauthorizedError } from '../middleware/errorHandler';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data);
      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('인증이 필요합니다');
      }
      const user = await authService.getMe(req.user.id);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('인증이 필요합니다');
      }
      const data = updateMeSchema.parse(req.body);
      const user = await authService.updateMe(req.user.id, data);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },
};
