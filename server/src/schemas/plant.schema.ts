import { z } from 'zod';

const nullableString = () => z.string().trim().min(1).nullable().optional();
const nullableIsoDate = () => z.string().datetime({ message: '올바른 ISO 8601 날짜 형식이 아닙니다' }).nullable().optional();
const nullablePrice = () => z.number().nonnegative('0 이상의 값이어야 합니다').nullable().optional();
const nullableInt = () => z.number().int().nonnegative('0 이상의 정수여야 합니다').nullable().optional();

/**
 * 개체 생성 요청 스키마 (docs/api-specification.md의 CreatePlant)
 * qrCode는 서버에서 자동 발급하므로 요청 바디에서 받지 않는다.
 */
export const createPlantSchema = z.object({
  speciesId: z.string().min(1, 'speciesId는 필수입니다'),
  nickname: nullableString(),
  locationId: nullableString(),
  statusId: z.string().min(1, 'statusId는 필수입니다'),
  originTypeId: z.string().min(1, 'originTypeId는 필수입니다'),
  parentPlantId: nullableString(),
  purchasePrice: nullablePrice(),
  sellingPrice: nullablePrice(),
  flowerColor: nullableString(),
  purchaseHeadCount: nullableInt(),
  purchaseUnitPrice: nullablePrice(),
  currentHeadCount: nullableInt(),
  unitSellingPrice: nullablePrice(),
  totalSellingPrice: nullablePrice(),
  purchaseVendor: nullableString(),
  purchaseFarm: nullableString(),
  purchaseDate: nullableIsoDate(),
  seedDate: nullableIsoDate(),
  potSize: nullableString(),
  memo: nullableString(),
  /** ADMIN/STAFF만 유효 — CUSTOMER는 서비스에서 무시 */
  ownerId: nullableString(),
  isPublic: z.boolean().optional(),
});

/**
 * 개체 수정 요청 스키마 — CreatePlant의 모든 필드 optional + ownerId, soldAt 추가.
 * qrCode, speciesId(품종 변경 불가)는 수정 대상에서 제외한다.
 */
export const updatePlantSchema = createPlantSchema
  .omit({ speciesId: true })
  .partial()
  .extend({
    ownerId: nullableString(),
    isPublic: z.boolean().optional(),
    soldAt: nullableIsoDate(),
  });

export const listPlantQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  speciesId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  originType: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['createdAt', 'updatedAt', 'sellingPrice', 'purchaseDate']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreatePlantInput = z.infer<typeof createPlantSchema>;
export type UpdatePlantInput = z.infer<typeof updatePlantSchema>;
export type ListPlantQuery = z.infer<typeof listPlantQuerySchema>;
