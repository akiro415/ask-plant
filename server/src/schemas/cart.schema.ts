import { z } from 'zod';

/** POST /cart/items */
export const addCartItemSchema = z
  .object({
    plantId: z.string().min(1).optional(),
    qrCode: z.string().trim().min(1).optional(),
    quantity: z.number().int().min(1).max(99).default(1),
  })
  .refine((data) => Boolean(data.plantId || data.qrCode), {
    message: 'plantId 또는 qrCode 중 하나는 필수입니다',
  });

/** PUT /cart/items/:id */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
