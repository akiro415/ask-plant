import { commonCodeRepository, type CommonCodeRow } from '../repositories/common-code.repository';
import { NotFoundError, ValidationAppError } from '../middleware/errorHandler';
import type { CreateCommonCodeInput, UpdateCommonCodeInput } from '../schemas/common-code.schema';

export interface CommonCodeDto {
  id: string;
  groupCode: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

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

export const commonCodeService = {
  async list(groupCode?: string, includeInactive = false): Promise<CommonCodeDto[]> {
    const rows = await commonCodeRepository.findMany(groupCode, includeInactive);
    return rows.map(toDto);
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
    const created = await commonCodeRepository.create(input);
    return toDto(created);
  },

  async update(id: string, input: UpdateCommonCodeInput): Promise<CommonCodeDto> {
    const existing = await commonCodeRepository.findById(id);
    if (!existing) throw new NotFoundError('공통코드를 찾을 수 없습니다');
    const updated = await commonCodeRepository.update(id, input);
    return toDto(updated);
  },

  async remove(id: string): Promise<CommonCodeDto> {
    const existing = await commonCodeRepository.findById(id);
    if (!existing) throw new NotFoundError('공통코드를 찾을 수 없습니다');
    const deactivated = await commonCodeRepository.deactivate(id);
    return toDto(deactivated);
  },
};
