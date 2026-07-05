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

export interface PlantSummary {
  id: string;
  qrCode: string;
  nickname: string | null;
  species: PlantSpeciesRef;
  location: PlantLocationRef | null;
  status: CommonCode;
  originType: CommonCode;
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
  owner: PlantOwnerRef | null;
  isPublic: boolean;
  childPlantCount: number;
  images: PlantImage[];
  histories: PlantHistory[];
}
