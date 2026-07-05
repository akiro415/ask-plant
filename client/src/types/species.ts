export type TaxonRank = 'SPECIES' | 'SP' | 'SSP' | 'VARIETY' | 'CULTIVAR' | 'HYBRID';

export const TAXON_RANK_LABEL: Record<TaxonRank, string> = {
  SPECIES: '종',
  SP: 'sp.',
  SSP: 'ssp.',
  VARIETY: '변종',
  CULTIVAR: '품종(cv.)',
  HYBRID: '교배종',
};

/** GET /species가 내려주는 카테고리 참조 형태(id/code/name만 포함, sortOrder 등은 미포함) */
export interface SpeciesCategory {
  id: string;
  code: string;
  name: string;
}

export interface Species {
  id: string;
  displayName: string;
  scientificName: string | null;
  englishName: string | null;
  koreanName: string | null;
  fieldNumber: string | null;
  sellerName: string | null;
  taxonRank: TaxonRank;
  isHybrid: boolean;
  parentSpecies1Id: string | null;
  parentSpecies2Id: string | null;
  category: SpeciesCategory | null;
  genus: string | null;
  family: string | null;
  careGuide: string | null;
  defaultWateringCycleDays: number | null;
  thumbnailUrl: string | null;
  plantCount: number;
  createdAt: string;
}
