import { z } from 'zod';

const nullableString = () => z.string().trim().min(1).nullable().optional();
const nullableUnitFloat = () => z.number().min(0).max(1).nullable().optional();

/** 위치 생성 요청 스키마 — server/prisma/schema.prisma의 PlantLocation 모델 필드 기준 */
export const createLocationSchema = z.object({
  code: z.string().trim().min(1, 'code는 필수입니다'),
  name: z.string().trim().min(1, 'name은 필수입니다'),
  description: nullableString(),
  /** CommonCode(groupCode: LOCATION_TYPE)의 id */
  typeId: nullableString(),
  /** 상위 위치(PlantLocation)의 id — 계층 구조 */
  parentId: nullableString(),
  imagePath: nullableString(),
  posX: nullableUnitFloat(),
  posY: nullableUnitFloat(),
  sortOrder: z.number().int().default(0),
});

/** 위치 수정 요청 스키마 — 전 필드 optional + isActive(비활성화) 포함 */
export const updateLocationSchema = createLocationSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const listLocationQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  parentId: z.string().min(1).optional(),
  typeId: z.string().min(1).optional(),
  includeInactive: z.coerce.boolean().default(false),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type ListLocationQuery = z.infer<typeof listLocationQuerySchema>;
