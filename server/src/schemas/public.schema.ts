import { z } from 'zod';

/** GET /public/plants 쿼리 */
export const listPublicPlantsQuerySchema = z.object({
  categoryId: z.string().min(1).optional(),
  speciesId: z.string().min(1).optional(),
  /** PLANT_STATUS code — 미지정 시 FOR_SALE(판매중)만 조회 */
  status: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListPublicPlantsQuery = z.infer<typeof listPublicPlantsQuerySchema>;
