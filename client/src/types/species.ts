import type { PlantCategory } from './common';

export type TaxonRank = 'SPECIES' | 'SP' | 'SSP' | 'VARIETY' | 'CULTIVAR' | 'HYBRID';

export const TAXON_RANK_LABEL: Record<TaxonRank, string> = {
  SPECIES: '종',
  SP: 'sp.',
  SSP: 'ssp.',
  VARIETY: '변종',
  CULTIVAR: '품종(cv.)',
  HYBRID: '교배종',
};

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
  category: PlantCategory | null;
  genus: string | null;
  family: string | null;
  careGuide: string | null;
  defaultWateringCycleDays: number | null;
  thumbnailUrl: string;
  plantCount: number;
  createdAt: string;
}
