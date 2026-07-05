import { z } from 'zod';

/** GET /qr/list 쿼리 */
export const listQrQuerySchema = z.object({
  plantId: z.string().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export type ListQrQuery = z.infer<typeof listQrQuerySchema>;
