import { z } from 'zod';

/** GET /plants/:id/histories 쿼리 */
export const listPlantHistoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/** GET /histories/recent 쿼리 — type=REPOT|SALE 등 HISTORY_TYPE CommonCode.code 필터 */
export const recentHistoriesQuerySchema = z.object({
  type: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

const nullableString = () => z.string().trim().min(1).nullable().optional();

/** POST /plants/:id/histories — type은 HISTORY_TYPE CommonCode.code (REPOT, SALE 등) */
export const createPlantHistorySchema = z.object({
  type: z.string().trim().min(1, 'type(HISTORY_TYPE code)은 필수입니다'),
  description: nullableString(),
  performedAt: z.coerce.date().optional(),
  title: nullableString(),
  amount: z.number().nullable().optional(),
});

/** PUT /histories/:id */
export const updateHistorySchema = z
  .object({
    type: z.string().trim().min(1).optional(),
    description: nullableString(),
    performedAt: z.coerce.date().optional(),
    title: nullableString(),
    amount: z.number().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 필드가 하나 이상 필요합니다' });

export type ListPlantHistoriesQuery = z.infer<typeof listPlantHistoriesQuerySchema>;
export type RecentHistoriesQuery = z.infer<typeof recentHistoriesQuerySchema>;
export type CreatePlantHistoryInput = z.infer<typeof createPlantHistorySchema>;
export type UpdateHistoryInput = z.infer<typeof updateHistorySchema>;
