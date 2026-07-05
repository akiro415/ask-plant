import { z } from 'zod';

/**
 * GET /api/v1/common-codes 쿼리 스키마
 * groupCode 미지정 시 전체 조회 (PLANT_STATUS, ORIGIN_TYPE, HISTORY_TYPE, LOCATION_TYPE 등)
 */
export const listCommonCodeQuerySchema = z.object({
  groupCode: z.string().trim().min(1).optional(),
});

export type ListCommonCodeQuery = z.infer<typeof listCommonCodeQuerySchema>;
