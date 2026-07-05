import { Request, Response, NextFunction } from 'express';
import { publicService } from '../services/public.service';
import { orderRequestService } from '../services/order-request.service';
import { listPublicPlantsQuerySchema } from '../schemas/public.schema';
import { createOrderRequestSchema } from '../schemas/order-request.schema';

export const publicController = {
  async listPlants(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listPublicPlantsQuerySchema.parse(req.query);
      const result = await publicService.list(query);
      res.json({ data: result.items, meta: result.meta });
    } catch (error) {
      next(error);
    }
  },

  async getPlantByQrCode(req: Request, res: Response, next: NextFunction) {
    try {
      const plant = await publicService.getByQrCode(String(req.params.qrCode));
      res.json({ data: plant });
    } catch (error) {
      next(error);
    }
  },

  /** POST /public/order-request — 로그인 없이 구매 요청 생성 */
  async createOrderRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createOrderRequestSchema.parse(req.body);
      const result = await orderRequestService.create(body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  },
};
