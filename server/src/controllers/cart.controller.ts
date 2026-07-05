import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { addCartItemSchema, updateCartItemSchema } from '../schemas/cart.schema';
import { UnauthorizedError } from '../middleware/errorHandler';
import type { AuthenticatedUser } from '../types/express';

function requireUser(req: Request): AuthenticatedUser {
  if (!req.user) throw new UnauthorizedError('인증이 필요합니다');
  return req.user;
}

export const cartController = {
  async getMyCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.getMyCart(requireUser(req));
      res.json({ data: cart });
    } catch (error) {
      next(error);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const input = addCartItemSchema.parse(req.body);
      const cart = await cartService.addItem(input, requireUser(req));
      res.status(201).json({ data: cart });
    } catch (error) {
      next(error);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateCartItemSchema.parse(req.body);
      const cart = await cartService.updateItem(String(req.params.id), input, requireUser(req));
      res.json({ data: cart });
    } catch (error) {
      next(error);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.removeItem(String(req.params.id), requireUser(req));
      res.json({ data: cart });
    } catch (error) {
      next(error);
    }
  },

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.clear(requireUser(req));
      res.json({ data: cart });
    } catch (error) {
      next(error);
    }
  },
};
