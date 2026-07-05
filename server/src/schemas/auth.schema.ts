import { z } from 'zod';

/**
 * 회원가입 요청 스키마 (docs/api-specification.md의 POST /auth/register)
 * role은 요청으로 받지 않는다 — 가입자는 항상 CUSTOMER로 생성된다.
 */
export const registerSchema = z.object({
  email: z.string().trim().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  name: z.string().trim().min(1, 'name은 필수입니다'),
  phone: z.string().trim().min(1).nullable().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, 'password는 필수입니다'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
