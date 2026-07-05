import type { CommonCode } from './common';
import type { PlantImage } from './image';
import type { PlantHistory } from './history';

export interface PlantSpeciesCategoryRef {
  id: string;
  code: string;
  name: string;
}

export interface PlantSpeciesRef {
  id: string;
  displayName: string;
  scientificName: string | null;
  koreanName: string | null;
  category: PlantSpeciesCategoryRef | null;
}

export interface PlantLocationRef {
  id: string;
  name: string;
}

export interface PlantParentRef {
  id: string;
  qrCode: string;
  displayName: string;
}

export type LifeCycleStage = 'SEED' | 'SOWING' | 'SEEDLING' | 'ADULT' | 'FOR_SALE' | 'SOLD' | 'PRESERVED';

export const LIFE_CYCLE_STAGE_LABEL: Record<LifeCycleStage, string> = {
  SEED: '씨앗',
  SOWING: '파종',
  SEEDLING: '묘목',
  ADULT: '성체',
  FOR_SALE: '판매',
  SOLD: '판매완료',
  PRESERVED: '보존',
};

export interface PlantSummary {
  id: string;
  qrCode: string;
  nickname: string | null;
  species: PlantSpeciesRef;
  location: PlantLocationRef | null;
  owner: PlantOwnerRef | null;
  status: CommonCode;
  originType: CommonCode;
  lifeCycleStage: LifeCycleStage | null;
  sellingPrice: number | null;
  flowerColor: string | null;
  purchaseHeadCount: number | null;
  purchaseUnitPrice: number | null;
  currentHeadCount: number | null;
  unitSellingPrice: number | null;
  totalSellingPrice: number | null;
  purchaseVendor: string | null;
  purchaseFarm: string | null;
  primaryImageUrl: string;
  createdAt: string;
}

export interface PlantOwnerRef {
  id: string;
  name: string;
  email: string;
}

export interface PlantDetail extends PlantSummary {
  purchasePrice: number | null;
  purchaseDate: string | null;
  seedDate: string | null;
  potSize: string | null;
  memo: string | null;
  parentPlant: PlantParentRef | null;
  parentPlant1: PlantParentRef | null;
  parentPlant2: PlantParentRef | null;
  owner: PlantOwnerRef | null;
  isPublic: boolean;
  childPlantCount: number;
  images: PlantImage[];
  histories: PlantHistory[];
}
