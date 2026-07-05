import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository';
import { signAccessToken } from '../lib/jwt';
import { ConflictError, NotFoundError, UnauthorizedError } from '../middleware/errorHandler';
import type { RegisterInput, LoginInput, UpdateMeInput } from '../schemas/auth.schema';
import type { User } from '@prisma/client';

const SALT_ROUNDS = 10;

export interface UserProfileDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: User['role'];
  createdAt: Date;
}

export interface LoginResultDto {
  accessToken: string;
  tokenType: 'Bearer';
  user: Pick<UserProfileDto, 'id' | 'email' | 'name' | 'role'>;
}

function toProfileDto(user: Pick<User, 'id' | 'email' | 'name' | 'phone' | 'role' | 'createdAt'>): UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const authService = {
  /** 회원가입 — role은 항상 CUSTOMER로 고정 생성 (docs/api-specification.md 1장) */
  async register(input: RegisterInput): Promise<UserProfileDto> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('이미 사용 중인 이메일입니다', [{ field: 'email', message: '중복된 이메일입니다' }]);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const created = await userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
      phone: input.phone ?? null,
      role: 'CUSTOMER',
    });

    return toProfileDto(created);
  },

  async login(input: LoginInput): Promise<LoginResultDto> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    return {
      accessToken,
      tokenType: 'Bearer',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  },

  async getMe(id: string): Promise<UserProfileDto> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다');
    }
    return toProfileDto(user);
  },

  /** 본인 프로필 수정 — name/phone만 변경 가능 */
  async updateMe(id: string, input: UpdateMeInput): Promise<UserProfileDto> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('사용자를 찾을 수 없습니다');
    }
    const updated = await userRepository.update(id, input);
    return toProfileDto(updated);
  },
};
