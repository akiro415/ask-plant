import { locationRepository, type LocationRow } from '../repositories/location.repository';
import { NotFoundError, ValidationAppError } from '../middleware/errorHandler';
import type { CreateLocationInput, UpdateLocationInput, ListLocationQuery } from '../schemas/location.schema';

export interface LocationDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
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

async function assertValidParent(parentId: string, selfId?: string): Promise<void> {
  const parent = await locationRepository.findById(parentId);
  if (!parent) {
    throw new ValidationAppError('존재하지 않는 parentId입니다', [{ field: 'parentId', message: '유효하지 않은 상위 위치입니다' }]);
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

export const locationService = {
  /** 쿼리 미지정 시 활성 위치 전체를 반환한다. */
  async list(query: ListLocationQuery = { includeInactive: false }): Promise<LocationDto[]> {
    const rows = await locationRepository.findMany({
      q: query.q,
      parentId: query.parentId,
      typeId: query.typeId,
      includeInactive: query.includeInactive,
    });
    return rows.map(toDto);
  },

  async getById(id: string): Promise<LocationDto> {
    const row = await locationRepository.findById(id);
    if (!row) throw new NotFoundError('위치를 찾을 수 없습니다');
    return toDto(row);
  },

  async create(input: CreateLocationInput): Promise<LocationDto> {
    if (input.parentId) {
      await assertValidParent(input.parentId);
    }
    const created = await locationRepository.create(input);
    return toDto(created);
  },

  async update(id: string, input: UpdateLocationInput): Promise<LocationDto> {
    const existing = await locationRepository.findById(id);
    if (!existing) throw new NotFoundError('위치를 찾을 수 없습니다');

    if (input.parentId) {
      await assertValidParent(input.parentId, id);
    }

    const updated = await locationRepository.update(id, input);
    return toDto(updated);
  },

  /**
   * 실제 row는 삭제하지 않고 isActive=false로만 바꾼다 — Plant.locationId, 하위 위치의 parentId FK가 절대 깨지지 않는다.
   * 사용 중인 개체 수는 참고용으로 반환해 관리자가 영향 범위를 확인할 수 있게 한다.
   */
  async remove(id: string): Promise<{ deactivatedUsageCount: number }> {
    const existing = await locationRepository.findById(id);
    if (!existing) throw new NotFoundError('위치를 찾을 수 없습니다');

    const usageCount = await locationRepository.countPlantsUsing(id);
    await locationRepository.softDelete(id);
    return { deactivatedUsageCount: usageCount };
  },
};
