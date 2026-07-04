import type { PlantDetail, PlantSummary } from '@/types/plant';
import { mockCategories } from './categories.mock';
import { mockCommonCodes, codesByGroup, findCommonCode } from './commonCodes.mock';
import { mockSpeciesList, findSpecies } from './species.mock';
import { mockLocations, findLocation } from './locations.mock';
import { mockUsers } from './users.mock';
import { plantSeeds, findPlantSeed, statusCommonCode, originCommonCode } from './plants.mock';
import { mockImages, imagesByPlantId, primaryImageUrl } from './images.mock';
import { mockHistories, historiesByPlantId } from './histories.mock';

function toSummary(seedId: string): PlantSummary {
  const seed = findPlantSeed(seedId)!;
  const species = findSpecies(seed.speciesId);
  const location = findLocation(seed.locationId);
  return {
    id: seed.id,
    qrCode: seed.qrCode,
    nickname: seed.nickname,
    species: {
      id: species.id,
      displayName: species.displayName,
      scientificName: species.scientificName,
      koreanName: species.koreanName,
      category: species.category,
    },
    location: location ? { id: location.id, name: location.name } : null,
    status: statusCommonCode(seed),
    originType: originCommonCode(seed),
    sellingPrice: seed.sellingPrice,
    primaryImageUrl: primaryImageUrl(seed.id),
    createdAt: seed.createdAt,
  };
}

function toDetail(seedId: string): PlantDetail {
  const seed = findPlantSeed(seedId)!;
  const summary = toSummary(seedId);
  const parent = seed.parentPlantId ? findPlantSeed(seed.parentPlantId) : undefined;
  const parentSpecies = parent ? findSpecies(parent.speciesId) : null;
  const childCount = plantSeeds.filter((p) => p.parentPlantId === seed.id).length;

  return {
    ...summary,
    purchasePrice: seed.purchasePrice,
    purchaseDate: seed.purchaseDate,
    seedDate: seed.seedDate,
    potSize: seed.potSize,
    memo: seed.memo,
    parentPlant: parent ? { id: parent.id, qrCode: parent.qrCode, displayName: parentSpecies?.displayName ?? '' } : null,
    childPlantCount: childCount,
    images: imagesByPlantId(seed.id),
    histories: historiesByPlantId(seed.id),
  };
}

export const mockPlantSummaries: PlantSummary[] = plantSeeds.map((seed) => toSummary(seed.id));
export const mockPlantDetails: PlantDetail[] = plantSeeds.map((seed) => toDetail(seed.id));

export function getPlantDetail(id: string): PlantDetail | null {
  return mockPlantDetails.find((p) => p.id === id) ?? null;
}

export function getPlantByQrCode(qrCode: string): PlantDetail | null {
  return mockPlantDetails.find((p) => p.qrCode === qrCode) ?? null;
}

export function getChildPlants(parentId: string): PlantSummary[] {
  const childIds = plantSeeds.filter((p) => p.parentPlantId === parentId).map((p) => p.id);
  return mockPlantSummaries.filter((p) => childIds.includes(p.id));
}

// 품종별 개체 수 반영
mockSpeciesList.forEach((species) => {
  species.plantCount = plantSeeds.filter((p) => p.speciesId === species.id).length;
});

// 위치별 개체 수 반영 (직속 개체만 집계)
mockLocations.forEach((location) => {
  location.plantCount = plantSeeds.filter((p) => p.locationId === location.id).length;
});

export {
  mockCategories,
  mockCommonCodes,
  codesByGroup,
  findCommonCode,
  mockSpeciesList,
  findSpecies,
  mockLocations,
  findLocation,
  mockUsers,
  mockImages,
  imagesByPlantId,
  mockHistories,
  historiesByPlantId,
};
