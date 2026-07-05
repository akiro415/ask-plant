import { commonCodeRepository, type CommonCodeRow } from '../repositories/common-code.repository';
import { NotFoundError, ValidationAppError } from '../middleware/errorHandler';
import type { CreateCommonCodeInput, UpdateCommonCodeInput, UpdateCommonCodeGroupInput } from '../schemas/common-code.schema';

export interface CommonCodeDto {
  id: string;
  groupCode: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CommonCodeGroupDto {
  groupCode: string;
  name: string;
  totalCount: number;
  activeCount: number;
}

const DEFAULT_GROUP_NAMES: Record<string, string> = {
  PLANT_STATUS: '식물 상태',
  HISTORY_TYPE: '이력 유형',
  LOCATION_TYPE: '위치 유형',
  ORIGIN_TYPE: '기원(번식) 유형',
};

function toDto(row: CommonCodeRow): CommonCodeDto {
  return {
    id: row.id,
    groupCode: row.groupCode,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

function defaultGroupName(groupCode: string): string {
  return DEFAULT_GROUP_NAMES[groupCode] ?? groupCode;
}

export const commonCodeService = {
  async list(groupCode?: string, includeInactive = false): Promise<CommonCodeDto[]> {
    const rows = await commonCodeRepository.findMany(groupCode, includeInactive);
    return rows.map(toDto);
  },

  async listGroups(): Promise<CommonCodeGroupDto[]> {
    const [groupCodes, storedGroups, allCodes] = await Promise.all([
      commonCodeRepository.findDistinctGroupCodes(),
      commonCodeRepository.findAllGroups(),
      commonCodeRepository.findMany(undefined, true),
    ]);

    const nameByCode = new Map(storedGroups.map((g) => [g.groupCode, g.name]));
    const countByCode = new Map<string, { total: number; active: number }>();

    for (const code of allCodes) {
      const current = countByCode.get(code.groupCode) ?? { total: 0, active: 0 };
      current.total += 1;
      if (code.isActive) current.active += 1;
      countByCode.set(code.groupCode, current);
    }

    const summaries: CommonCodeGroupDto[] = [];
    for (const groupCode of groupCodes) {
      const counts = countByCode.get(groupCode) ?? { total: 0, active: 0 };
      summaries.push({
        groupCode,
        name: nameByCode.get(groupCode) ?? defaultGroupName(groupCode),
        totalCount: counts.total,
        activeCount: counts.active,
      });
    }

    return summaries;
  },

  async getById(id: string): Promise<CommonCodeDto> {
    const row = await commonCodeRepository.findById(id);
    if (!row) throw new NotFoundError('공통코드를 찾을 수 없습니다');
    return toDto(row);
  },

  async create(input: CreateCommonCodeInput): Promise<CommonCodeDto> {
    const rows = await commonCodeRepository.findMany(input.groupCode, true);
    if (rows.some((c) => c.code === input.code)) {
      throw new ValidationAppError('이미 존재하는 코드입니다', [{ field: 'code', message: '중복 code' }]);
    }

    const existingGroup = await commonCodeRepository.findGroupByCode(input.groupCode);
    if (!existingGroup) {
      await commonCodeRepository.upsertGroup(input.groupCode, defaultGroupName(input.groupCode));
    }

    const created = await commonCodeRepository.create(input);
    return toDto(created);
  },

  async update(id: string, input: UpdateCommonCodeInput): Promise<CommonCodeDto> {
    const existing = await commonCodeRepository.findById(id);
    if (!existing) throw new NotFoundError('공통코드를 찾을 수 없습니다');

    const nextGroupCode = input.groupCode ?? existing.groupCode;
    const nextCode = input.code ?? existing.code;
    if (nextGroupCode !== existing.groupCode || nextCode !== existing.code) {
      const duplicate = await commonCodeRepository.findDuplicate(nextGroupCode, nextCode, id);
      if (duplicate) {
        throw new ValidationAppError('이미 존재하는 그룹·코드 조합입니다', [
          { field: 'code', message: `${nextGroupCode}.${nextCode} 가 이미 사용 중입니다` },
        ]);
      }
    }

    const updated = await commonCodeRepository.update(id, input);
    return toDto(updated);
  },

  async updateGroup(groupCode: string, input: UpdateCommonCodeGroupInput): Promise<CommonCodeGroupDto> {
    const codes = await commonCodeRepository.findMany(groupCode, true);
    if (codes.length === 0) {
      throw new NotFoundError('그룹을 찾을 수 없습니다');
    }

    await commonCodeRepository.upsertGroup(groupCode, input.name);
    return {
      groupCode,
      name: input.name,
      totalCount: codes.length,
      activeCount: codes.filter((c) => c.isActive).length,
    };
  },

  async remove(id: string): Promise<CommonCodeDto> {
    const existing = await commonCodeRepository.findById(id);
    if (!existing) throw new NotFoundError('공통코드를 찾을 수 없습니다');
    const deactivated = await commonCodeRepository.deactivate(id);
    return toDto(deactivated);
  },
};
