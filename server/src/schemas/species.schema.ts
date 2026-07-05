import { z } from 'zod';

const nullableString = () => z.string().trim().min(1).nullable().optional();
const taxonRankEnum = z.enum(['SPECIES', 'SP', 'SSP', 'VARIETY', 'CULTIVAR', 'HYBRID']);

/** 품종 생성 요청 스키마 — server/prisma/schema.prisma의 Species 모델 필드 기준 */
export const createSpeciesSchema = z.object({
  displayName: z.string().trim().min(1, 'displayName은 필수입니다'),
  scientificName: nullableString(),
  englishName: nullableString(),
  koreanName: nullableString(),
  fieldNumber: nullableString(),
  sellerName: nullableString(),
  taxonRank: taxonRankEnum.default('SPECIES'),
  isHybrid: z.boolean().default(false),
  parentSpecies1Id: nullableString(),
  parentSpecies2Id: nullableString(),
  categoryId: nullableString(),
  family: nullableString(),
  genus: nullableString(),
  description: nullableString(),
  careGuide: nullableString(),
  defaultWateringCycleDays: z.number().int().positive().nullable().optional(),
  thumbnailUrl: nullableString(),
});

/** 품종 수정 요청 스키마 — 전 필드 optional + isActive(비활성화) 포함 */
export const updateSpeciesSchema = createSpeciesSchema.partial().extend({
  isActive: z.boolean().optional(),
});

/**
 * GET /species 쿼리 스키마.
 * 쿼리를 지정하지 않으면 기존과 동일하게 "활성 품종 전체"를 반환한다(하위 호환).
 */
export const listSpeciesQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  includeInactive: z.coerce.boolean().default(false),
});

export type CreateSpeciesInput = z.infer<typeof createSpeciesSchema>;
export type UpdateSpeciesInput = z.infer<typeof updateSpeciesSchema>;
export type ListSpeciesQuery = z.infer<typeof listSpeciesQuerySchema>;
