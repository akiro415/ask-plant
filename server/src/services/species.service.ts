import { speciesRepository, type SpeciesDetailRow } from '../repositories/species.repository';
import { NotFoundError } from '../middleware/errorHandler';
import type { CreateSpeciesInput, UpdateSpeciesInput, ListSpeciesQuery } from '../schemas/species.schema';

export interface SpeciesSummaryDto {
  id: string;
  displayName: string;
  scientificName: string | null;
  koreanName: string | null;
  category: { id: string; code: string; name: string } | null;
}

export interface SpeciesDetailDto extends SpeciesSummaryDto {
  englishName: string | null;
  fieldNumber: string | null;
  sellerName: string | null;
  taxonRank: string;
  isHybrid: boolean;
  parentSpecies1Id: string | null;
  parentSpecies2Id: string | null;
  family: string | null;
  genus: string | null;
  description: string | null;
  careGuide: string | null;
  defaultWateringCycleDays: number | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toSummaryDto(row: SpeciesDetailRow): SpeciesSummaryDto {
  return {
    id: row.id,
    displayName: row.displayName,
    scientificName: row.scientificName,
    koreanName: row.koreanName,
    category: row.category ? { id: row.category.id, code: row.category.code, name: row.category.name } : null,
  };
}

function toDetailDto(row: SpeciesDetailRow): SpeciesDetailDto {
  return {
    ...toSummaryDto(row),
    englishName: row.englishName,
    fieldNumber: row.fieldNumber,
    sellerName: row.sellerName,
    taxonRank: row.taxonRank,
    isHybrid: row.isHybrid,
    parentSpecies1Id: row.parentSpecies1Id,
    parentSpecies2Id: row.parentSpecies2Id,
    family: row.family,
    genus: row.genus,
    description: row.description,
    careGuide: row.careGuide,
    defaultWateringCycleDays: row.defaultWateringCycleDays,
    thumbnailUrl: row.thumbnailUrl,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const speciesService = {
  /**
   * 쿼리 미지정 시 기존과 동일하게 활성 품종 전체를 반환한다(하위 호환).
   * 응답에는 최소 필드(id/displayName/scientificName/koreanName/category)에 더해
   * 관리자 화면(Species 목록/상세)에 필요한 전 필드를 함께 내려준다 — 기존 소비자는 필요한 필드만 읽으므로 영향 없다.
   */
  async list(query: ListSpeciesQuery = { includeInactive: false }): Promise<SpeciesDetailDto[]> {
    const rows = await speciesRepository.findMany({
      q: query.q,
      categoryId: query.categoryId,
      includeInactive: query.includeInactive,
    });
    return rows.map(toDetailDto);
  },

  async getById(id: string): Promise<SpeciesDetailDto> {
    const row = await speciesRepository.findById(id);
    if (!row) throw new NotFoundError('품종을 찾을 수 없습니다');
    return toDetailDto(row);
  },

  async create(input: CreateSpeciesInput): Promise<SpeciesDetailDto> {
    const created = await speciesRepository.create(input);
    return toDetailDto(created);
  },

  async update(id: string, input: UpdateSpeciesInput): Promise<SpeciesDetailDto> {
    const existing = await speciesRepository.findById(id);
    if (!existing) throw new NotFoundError('품종을 찾을 수 없습니다');

    const updated = await speciesRepository.update(id, input);
    return toDetailDto(updated);
  },

  /**
   * 실제 row는 삭제하지 않고 isActive=false로만 바꾼다 — 이미 등록된 Plant.speciesId FK가 절대 깨지지 않는다.
   * 사용 중인 개체 수는 참고용으로 함께 반환해 관리자가 영향 범위를 확인할 수 있게 한다.
   */
  async remove(id: string): Promise<{ deactivatedUsageCount: number }> {
    const existing = await speciesRepository.findById(id);
    if (!existing) throw new NotFoundError('품종을 찾을 수 없습니다');

    const usageCount = await speciesRepository.countPlantsUsing(id);
    await speciesRepository.softDelete(id);
    return { deactivatedUsageCount: usageCount };
  },
};
