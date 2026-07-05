import { userRepository, type UserRow } from '../repositories/user.repository';
import { ForbiddenError, NotFoundError, ValidationAppError } from '../middleware/errorHandler';
import type { ListUsersQuery, UpdateUserInput } from '../schemas/user.schema';
import type { AuthenticatedUser } from '../types/express';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(row: UserRow): UserDto {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function assertCanModifyTarget(targetId: string, input: UpdateUserInput, requestUser: AuthenticatedUser): Promise<UserRow> {
  const existing = await userRepository.findById(targetId);
  if (!existing) throw new NotFoundError('사용자를 찾을 수 없습니다');

  if (targetId === requestUser.id) {
    if (input.role !== undefined && input.role !== 'ADMIN') {
      throw new ForbiddenError('본인의 역할을 ADMIN 이외로 변경할 수 없습니다');
    }
    if (input.isActive === false) {
      throw new ForbiddenError('본인 계정을 비활성화할 수 없습니다');
    }
  }

  const willLoseAdmin =
    existing.role === 'ADMIN' &&
    existing.isActive &&
    ((input.role !== undefined && input.role !== 'ADMIN') || input.isActive === false);

  if (willLoseAdmin) {
    const otherAdmins = await userRepository.countActiveAdmins(targetId);
    if (otherAdmins === 0) {
      throw new ValidationAppError('시스템에 활성 ADMIN이 최소 1명은 필요합니다', [
        { field: 'role', message: '마지막 ADMIN의 역할 변경 또는 비활성화는 불가합니다' },
      ]);
    }
  }

  return existing;
}

export const userService = {
  async list(query: ListUsersQuery): Promise<UserDto[]> {
    const rows = await userRepository.findMany({
      q: query.q,
      role: query.role,
      includeInactive: query.includeInactive,
    });
    return rows.map(toDto);
  },

  async getById(id: string): Promise<UserDto> {
    const row = await userRepository.findById(id);
    if (!row) throw new NotFoundError('사용자를 찾을 수 없습니다');
    return toDto(row);
  },

  async update(id: string, input: UpdateUserInput, requestUser: AuthenticatedUser): Promise<UserDto> {
    await assertCanModifyTarget(id, input, requestUser);
    const updated = await userRepository.update(id, input);
    return toDto(updated);
  },

  async remove(id: string, requestUser: AuthenticatedUser): Promise<UserDto> {
    if (id === requestUser.id) {
      throw new ForbiddenError('본인 계정을 삭제할 수 없습니다');
    }

    const existing = await userRepository.findById(id);
    if (!existing) throw new NotFoundError('사용자를 찾을 수 없습니다');

    if (existing.role === 'ADMIN' && existing.isActive) {
      const otherAdmins = await userRepository.countActiveAdmins(id);
      if (otherAdmins === 0) {
        throw new ValidationAppError('시스템에 활성 ADMIN이 최소 1명은 필요합니다', [
          { field: 'id', message: '마지막 ADMIN은 삭제할 수 없습니다' },
        ]);
      }
    }

    const deactivated = await userRepository.softDelete(id);
    return toDto(deactivated);
  },
};
