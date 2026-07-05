import { commonCodeRepository, type CommonCodeRow } from '../repositories/common-code.repository';

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
  async list(groupCode?: string): Promise<CommonCodeDto[]> {
    const rows = await commonCodeRepository.findMany(groupCode);
    return rows.map(toDto);
  },
};
