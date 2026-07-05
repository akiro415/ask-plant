import { speciesRepository, type SpeciesSelectRow } from '../repositories/species.repository';

export interface SpeciesSummaryDto {
  id: string;
  displayName: string;
  scientificName: string | null;
  koreanName: string | null;
  category: { id: string; code: string; name: string } | null;
}

function toDto(row: SpeciesSelectRow): SpeciesSummaryDto {
  return {
    id: row.id,
    displayName: row.displayName,
    scientificName: row.scientificName,
    koreanName: row.koreanName,
    category: row.category ? { id: row.category.id, code: row.category.code, name: row.category.name } : null,
  };
}

export const speciesService = {
  async list(): Promise<SpeciesSummaryDto[]> {
    const rows = await speciesRepository.findManyForSelect();
    return rows.map(toDto);
  },
};
