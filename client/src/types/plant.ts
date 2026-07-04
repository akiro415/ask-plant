import type { CommonCode, PlantCategory } from './common';
import type { PlantImage } from './image';
import type { PlantHistory } from './history';

export interface PlantSpeciesRef {
  id: string;
  displayName: string;
  scientificName: string | null;
  koreanName: string | null;
  category: PlantCategory | null;
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
  primaryImageUrl: string;
  createdAt: string;
}

export interface PlantDetail extends PlantSummary {
  purchasePrice: number | null;
  purchaseDate: string | null;
  seedDate: string | null;
  potSize: string | null;
  memo: string | null;
  parentPlant: PlantParentRef | null;
  childPlantCount: number;
  images: PlantImage[];
  histories: PlantHistory[];
}
