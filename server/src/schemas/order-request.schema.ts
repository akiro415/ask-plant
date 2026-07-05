import { z } from 'zod';

const orderItemSchema = z.object({
  qrCode: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  priceSnapshot: z.number().nonnegative(),
});

export const createOrderRequestSchema = z.object({
  sessionId: z.string().trim().min(1).optional(),
  customerName: z.string().trim().min(1, '이름은 필수입니다'),
  customerPhone: z.string().trim().min(1, '연락처는 필수입니다'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  memo: z.string().trim().optional(),
  items: z.array(orderItemSchema).min(1, '장바구니 항목이 필요합니다'),
});

export type CreateOrderRequestInput = z.infer<typeof createOrderRequestSchema>;
