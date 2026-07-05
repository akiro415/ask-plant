import { z } from 'zod';

const imageTypeEnum = z.enum(['PRIMARY', 'FLOWER', 'SALE', 'OTHER']);

/** GET /plants/:id/images 쿼리 */
export const listPlantImagesQuerySchema = z.object({
  imageType: imageTypeEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/** GET /images/recent 쿼리 */
export const recentImagesQuerySchema = z.object({
  imageType: imageTypeEnum.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

/** GET /images 목록 쿼리 — 사진관리 화면용 */
export const listImagesQuerySchema = z.object({
  imageType: imageTypeEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const nullableString = () => z.string().trim().min(1).nullable().optional();

/** POST /plants/:id/images — multer 미사용, url(또는 imageUrl)로 등록 */
export const createPlantImageSchema = z.object({
  url: z.string().trim().min(1, 'url은 필수입니다').optional(),
  imageUrl: z.string().trim().min(1).optional(),
  imageType: imageTypeEnum.default('OTHER'),
  caption: nullableString(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
}).refine((data) => Boolean(data.url?.trim() || data.imageUrl?.trim()), {
  message: 'url 또는 imageUrl 중 하나는 필수입니다',
  path: ['url'],
});

/** PUT /images/:id */
export const updateImageSchema = z
  .object({
    url: z.string().trim().min(1).optional(),
    imageUrl: z.string().trim().min(1).optional(),
    imageType: imageTypeEnum.optional(),
    caption: nullableString(),
    isPrimary: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 필드가 하나 이상 필요합니다' });

export type ListPlantImagesQuery = z.infer<typeof listPlantImagesQuerySchema>;
export type RecentImagesQuery = z.infer<typeof recentImagesQuerySchema>;
export type ListImagesQuery = z.infer<typeof listImagesQuerySchema>;
export type CreatePlantImageInput = z.infer<typeof createPlantImageSchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
