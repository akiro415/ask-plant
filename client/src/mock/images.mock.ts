import type { PlantImage, ImageType } from '@/types/image';
import { plantSeeds } from './plants.mock';
import { placeholderImage } from '@/utils/placeholder';

const DAY_MS = 1000 * 60 * 60 * 24;
function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

let seq = 0;
function makeImage(plantId: string, imageType: ImageType, isPrimary: boolean, sortOrder: number, daysOld: number, label: string): PlantImage {
  seq += 1;
  const id = `img-${String(seq).padStart(4, '0')}`;
  return {
    id,
    plantId,
    url: placeholderImage(id, label),
    imageType,
    caption: null,
    isPrimary,
    sortOrder,
    createdAt: daysAgo(daysOld),
  };
}

export const mockImages: PlantImage[] = [];

plantSeeds.forEach((seed, index) => {
  mockImages.push(makeImage(seed.id, 'PRIMARY', true, 0, 3 + (index % 5), '🌵'));

  if (index % 3 === 0) {
    mockImages.push(makeImage(seed.id, 'FLOWER', false, 1, 2 + (index % 4), '🌸'));
  }
  if (index % 2 === 0) {
    mockImages.push(makeImage(seed.id, 'OTHER', false, 2, 6 + (index % 6), '🪴'));
  }
  if (seed.statusCode === 'FOR_SALE' || seed.statusCode === 'SOLD') {
    mockImages.push(makeImage(seed.id, 'SALE', false, 3, 1 + (index % 3), '🏷️'));
  }
});

export function imagesByPlantId(plantId: string): PlantImage[] {
  return mockImages.filter((img) => img.plantId === plantId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findImageByType(plantId: string, imageType: ImageType): PlantImage | null {
  return mockImages.find((img) => img.plantId === plantId && img.imageType === imageType) ?? null;
}

export function primaryImageUrl(plantId: string): string {
  const primary = mockImages.find((img) => img.plantId === plantId && img.isPrimary);
  return primary?.url ?? placeholderImage(plantId, '🌵');
}
