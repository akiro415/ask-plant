import {
  assertOwnerAccess,
  ownerScopeFilter,
} from '../lib/rbac';
import { locationRepository, type LocationRow } from '../repositories/location.repository';
import { NotFoundError, ValidationAppError } from '../middleware/errorHandler';
import type { CreateLocationInput, UpdateLocationInput, ListLocationQuery } from '../schemas/location.schema';
import type { AuthenticatedUser } from '../types/express';

export interface LocationDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  ownerId: string;
  typeId: string | null;
  parentId: string | null;
  imagePath: string | null;
  posX: number | null;
  posY: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: { id: string; code: string; name: string } | null;
  parent: { id: string; code: string; name: string } | null;
}

function toDto(row: LocationRow): LocationDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    ownerId: row.ownerId,
    typeId: row.typeId,
    parentId: row.parentId,
    imagePath: row.imagePath,
    posX: row.posX,
    posY: row.posY,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    type: row.type ? { id: row.type.id, code: row.type.code, name: row.type.name } : null,
    parent: row.parent ? { id: row.parent.id, code: row.parent.code, name: row.parent.name } : null,
  };
}

async function assertValidParent(parentId: string, ownerId: string, selfId?: string): Promise<void> {
  const parent = await locationRepository.findById(parentId);
  if (!parent) {
    throw new ValidationAppError('존재하지 않는 parentId입니다', [{ field: 'parentId', message: '유효하지 않은 상위 위치입니다' }]);
  }
  if (parent.ownerId !== ownerId) {
    throw new ValidationAppError('상위 위치는 동일 소유자의 위치여야 합니다', [{ field: 'parentId', message: '소유자가 다른 위치는 상위로 지정할 수 없습니다' }]);
  }
  if (selfId) {
    if (parentId === selfId) {
      throw new ValidationAppError('자기 자신을 상위 위치로 지정할 수 없습니다', [{ field: 'parentId', message: '자기 자신은 상위가 될 수 없습니다' }]);
    }
    const cycle = await locationRepository.wouldCreateCycle(selfId, parentId);
    if (cycle) {
      throw new ValidationAppError('순환 참조가 발생하는 상위 위치입니다', [{ field: 'parentId', message: '하위 위치를 상위로 지정할 수 없습니다' }]);
    }
  }
}

function assertCanAccess(row: Pick<LocationRow, 'ownerId'>, user: AuthenticatedUser): void {
  assertOwnerAccess(row.ownerId, user);
}

export const locationService = {
  async list(query: ListLocationQuery, user: AuthenticatedUser): Promise<LocationDto[]> {
    const rows = await locationRepository.findMany({
      q: query.q,
      parentId: query.parentId,
      typeId: query.typeId,
      includeInactive: query.includeInactive,
      ownerId: ownerScopeFilter(user),
    });
    return rows.map(toDto);
  },

  async getById(id: string, user: AuthenticatedUser): Promise<LocationDto> {
    const row = await locationRepository.findById(id);
    if (!row) throw new NotFoundError('위치를 찾을 수 없습니다');
    assertCanAccess(row, user);
    return toDto(row);
  },

  async create(input: CreateLocationInput, user: AuthenticatedUser): Promise<LocationDto> {
    const ownerId = user.id;
    if (input.parentId) {
      await assertValidParent(input.parentId, ownerId);
    }
    const created = await locationRepository.create({ ...input, ownerId });
    return toDto(created);
  },

  async update(id: string, input: UpdateLocationInput, user: AuthenticatedUser): Promise<LocationDto> {
    const existing = await locationRepository.findById(id);
    if (!existing) throw new NotFoundError('위치를 찾을 수 없습니다');
    assertCanAccess(existing, user);

    if (input.parentId) {
      await assertValidParent(input.parentId, existing.ownerId, id);
    }

    const updated = await locationRepository.update(id, input);
    return toDto(updated);
  },

  async remove(id: string, user: AuthenticatedUser): Promise<{ deactivatedUsageCount: number }> {
    const existing = await locationRepository.findById(id);
    if (!existing) throw new NotFoundError('위치를 찾을 수 없습니다');
    assertCanAccess(existing, user);

    const usageCount = await locationRepository.countPlantsUsing(id);
    await locationRepository.softDelete(id);
    return { deactivatedUsageCount: usageCount };
  },
};
