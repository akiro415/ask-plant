import { z } from 'zod';

export const listCommonCodeQuerySchema = z.object({
  groupCode: z.string().trim().min(1).optional(),
  includeInactive: z.coerce.boolean().default(false),
});

export const createCommonCodeSchema = z.object({
  groupCode: z.string().trim().min(1, 'groupCode는 필수입니다'),
  code: z.string().trim().min(1, 'code는 필수입니다'),
  name: z.string().trim().min(1, 'name은 필수입니다'),
  description: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const updateCommonCodeSchema = createCommonCodeSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: '수정할 필드가 하나 이상 필요합니다',
});

export type ListCommonCodeQuery = z.infer<typeof listCommonCodeQuerySchema>;
export type CreateCommonCodeInput = z.infer<typeof createCommonCodeSchema>;
export type UpdateCommonCodeInput = z.infer<typeof updateCommonCodeSchema>;
