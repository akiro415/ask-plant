import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { listUsersQuerySchema, updateUserSchema, createUserSchema } from '../schemas/user.schema';
import { UnauthorizedError } from '../middleware/errorHandler';
import type { AuthenticatedUser } from '../types/express';

function requireUser(req: Request): AuthenticatedUser {
  if (!req.user) throw new UnauthorizedError('인증이 필요합니다');
  return req.user;
}

export const userController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listUsersQuerySchema.parse(req.query);
      const items = await userService.list(query);
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(String(req.params.id));
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await userService.create(data);
      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await userService.update(String(req.params.id), data, requireUser(req));
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.remove(String(req.params.id), requireUser(req));
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },
};
