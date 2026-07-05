import { z } from 'zod';

const userRoleEnum = z.enum(['ADMIN', 'STAFF', 'CUSTOMER']);
const nullableString = () => z.string().trim().min(1).nullable().optional();

/** GET /users 쿼리 */
export const listUsersQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  role: userRoleEnum.optional(),
  includeInactive: z.coerce.boolean().default(false),
});

/** PUT /users/:id 요청 — ADMIN이 사용자 정보/역할/활성 상태를 변경 */
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, 'name은 필수입니다').optional(),
    phone: nullableString(),
    role: userRoleEnum.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 필드가 하나 이상 필요합니다' });

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
