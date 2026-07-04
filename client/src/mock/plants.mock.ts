import { mockSpeciesList } from './species.mock';
import { leafLocationIds } from './locations.mock';
import { findCommonCode } from './commonCodes.mock';
import { mulberry32 } from '@/utils/placeholder';

export interface PlantSeed {
  id: string;
  qrCode: string;
  nickname: string | null;
  speciesId: string;
  locationId: string | null;
  statusCode: string;
  originCode: string;
  purchasePrice: number | null;
  sellingPrice: number | null;
  purchaseDate: string | null;
  seedDate: string | null;
  potSize: string;
  memo: string | null;
  parentPlantId: string | null;
  createdAt: string;
}

const STATUS_CYCLE = ['FOR_SALE', 'FOR_SALE', 'IN_STOCK', 'SOLD', 'FOR_SALE', 'RESERVED', 'IN_STOCK', 'SOLD', 'FOR_SALE', 'DISCARDED'];
const ORIGIN_CYCLE = ['PURCHASE', 'PURCHASE', 'SEEDLING', 'CUTTING', 'PURCHASE', 'OFFSET', 'PURCHASE', 'GRAFT', 'EXCHANGE', 'PURCHASE'];
const POT_SIZES = ['3cm', '5cm', '7cm', '10cm', '2.5inch', '4inch'];
const PLANTS_PER_SPECIES = 4;
const DAY_MS = 1000 * 60 * 60 * 24;

function pad6(n: number): string {
  return String(n).padStart(6, '0');
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

const qrCounters = new Map<string, number>();
function nextQrCode(categoryCode: string): string {
  const current = qrCounters.get(categoryCode) ?? 0;
  const next = current + 1;
  qrCounters.set(categoryCode, next);
  return `${categoryCode}-${pad6(next)}`;
}

const plantSeeds: PlantSeed[] = [];
let globalIndex = 0;
const lastPlantIdBySpecies = new Map<string, string>();

for (const species of mockSpeciesList) {
  const categoryCode = species.category?.code ?? 'OTH';

  for (let i = 0; i < PLANTS_PER_SPECIES; i++) {
    const rng = mulberry32(globalIndex * 7919 + 13);
    const id = `plant-${String(globalIndex + 1).padStart(3, '0')}`;
    const statusCode = STATUS_CYCLE[globalIndex % STATUS_CYCLE.length];
    const originCode = i === 0 ? 'PURCHASE' : ORIGIN_CYCLE[globalIndex % ORIGIN_CYCLE.length];
    const isPurchase = originCode === 'PURCHASE' || originCode === 'EXCHANGE' || originCode === 'GRAFT';
    const isSeedling = originCode === 'SEEDLING';
    const createdDaysAgo = 5 + globalIndex * 3 + Math.floor(rng() * 10);
    const basePrice = 15000 + Math.floor(rng() * 12) * 5000 + (species.isHybrid ? 30000 : 0);

    const parentPlantId = i > 0 && rng() > 0.4 ? (lastPlantIdBySpecies.get(species.id) ?? null) : null;

    const seed: PlantSeed = {
      id,
      qrCode: nextQrCode(categoryCode),
      nickname: rng() > 0.45 ? `${species.koreanName ?? species.displayName}-${i + 1}` : null,
      speciesId: species.id,
      locationId: leafLocationIds[globalIndex % leafLocationIds.length],
      statusCode,
      originCode,
      purchasePrice: isPurchase ? basePrice : null,
      sellingPrice: ['FOR_SALE', 'RESERVED', 'SOLD'].includes(statusCode) ? basePrice + 10000 + Math.floor(rng() * 6) * 5000 : null,
      purchaseDate: isPurchase ? daysAgo(createdDaysAgo + 2) : null,
      seedDate: isSeedling ? daysAgo(createdDaysAgo + 30) : null,
      potSize: POT_SIZES[globalIndex % POT_SIZES.length],
      memo: rng() > 0.6 ? '생육 상태 양호. 정기 관찰 대상.' : null,
      parentPlantId,
      createdAt: daysAgo(createdDaysAgo),
    };

    plantSeeds.push(seed);
    lastPlantIdBySpecies.set(species.id, id);
    globalIndex += 1;
  }
}

export { plantSeeds };

export function findPlantSeed(id: string): PlantSeed | undefined {
  return plantSeeds.find((p) => p.id === id);
}

export function statusCommonCode(seed: PlantSeed) {
  return findCommonCode('PLANT_STATUS', seed.statusCode);
}

export function originCommonCode(seed: PlantSeed) {
  return findCommonCode('ORIGIN_TYPE', seed.originCode);
}
