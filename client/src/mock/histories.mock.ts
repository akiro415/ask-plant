import type { PlantHistory } from '@/types/history';
import { plantSeeds, findPlantSeed } from './plants.mock';
import { findCommonCode } from './commonCodes.mock';
import { findLocation, leafLocationIds } from './locations.mock';
import { findImageByType } from './images.mock';
import { mulberry32 } from '@/utils/placeholder';

const DAY_MS = 1000 * 60 * 60 * 24;
function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

const STAFF_NAMES = ['김직원', '이직원', '관리자'];

const ORIGIN_METHOD_LABEL: Record<string, string> = {
  SEEDLING: '실생',
  CUTTING: '삽목',
  OFFSET: '분지',
  GRAFT: '접목',
  EXCHANGE: '교환',
  DONATION: '나눔',
  IMPORT: '수입',
  SEED_COLLECTED: '채종',
  PURCHASE: '구매',
};

let seq = 0;
function nextId(): string {
  seq += 1;
  return `hist-${String(seq).padStart(4, '0')}`;
}

export const mockHistories: PlantHistory[] = [];

for (const seed of plantSeeds) {
  const rng = mulberry32(seq * 104729 + 7);
  const createdDaysAgo = Math.floor((Date.now() - new Date(seed.createdAt).getTime()) / DAY_MS);

  // 1) 입고 or 번식 이력
  if (seed.parentPlantId) {
    const parent = findPlantSeed(seed.parentPlantId);
    mockHistories.push({
      id: nextId(),
      plantId: seed.id,
      historyType: findCommonCode('HISTORY_TYPE', 'PROPAGATION'),
      performedAt: seed.createdAt,
      performedBy: STAFF_NAMES[seq % STAFF_NAMES.length],
      title: `${ORIGIN_METHOD_LABEL[seed.originCode] ?? seed.originCode}으로 신규 개체 생성`,
      description: parent ? `모株(${parent.qrCode})에서 ${ORIGIN_METHOD_LABEL[seed.originCode]}로 파생` : null,
      amount: null,
      fromLocation: null,
      toLocation: null,
      image: null,
      metadata: { method: seed.originCode, parentPlantId: seed.parentPlantId },
    });
  } else {
    mockHistories.push({
      id: nextId(),
      plantId: seed.id,
      historyType: findCommonCode('HISTORY_TYPE', 'ACQUISITION'),
      performedAt: seed.createdAt,
      performedBy: STAFF_NAMES[seq % STAFF_NAMES.length],
      title: '입고',
      description: `${ORIGIN_METHOD_LABEL[seed.originCode] ?? seed.originCode}(으)로 입고`,
      amount: null,
      fromLocation: null,
      toLocation: null,
      image: null,
      metadata: { method: seed.originCode },
    });
  }

  // 2) 분갈이 (60% 확률)
  if (rng() > 0.4 && createdDaysAgo > 10) {
    const repotDaysAgo = Math.max(1, createdDaysAgo - Math.floor(createdDaysAgo * 0.4));
    const repotImage = findImageByType(seed.id, 'OTHER');
    mockHistories.push({
      id: nextId(),
      plantId: seed.id,
      historyType: findCommonCode('HISTORY_TYPE', 'REPOT'),
      performedAt: daysAgo(repotDaysAgo),
      performedBy: STAFF_NAMES[(seq + 1) % STAFF_NAMES.length],
      title: '분갈이',
      description: `${seed.potSize} 화분으로 이식`,
      amount: null,
      fromLocation: null,
      toLocation: null,
      image: repotImage ? { id: repotImage.id, url: repotImage.url } : null,
      metadata: { potSize: seed.potSize, soilMix: '배양토+펄라이트+마사토' },
    });
  }

  // 3) 위치변경 (30% 확률)
  if (rng() > 0.7 && seed.locationId) {
    const otherLocationId = leafLocationIds.find((id) => id !== seed.locationId) ?? seed.locationId;
    const from = findLocation(otherLocationId);
    const to = findLocation(seed.locationId);
    mockHistories.push({
      id: nextId(),
      plantId: seed.id,
      historyType: findCommonCode('HISTORY_TYPE', 'LOCATION_CHANGE'),
      performedAt: daysAgo(Math.max(1, Math.floor(createdDaysAgo * 0.5))),
      performedBy: STAFF_NAMES[(seq + 2) % STAFF_NAMES.length],
      title: '위치변경',
      description: `${from?.name ?? '-'} → ${to?.name ?? '-'}`,
      amount: null,
      fromLocation: from ? { id: from.id, name: from.name } : null,
      toLocation: to ? { id: to.id, name: to.name } : null,
      image: null,
      metadata: null,
    });
  }

  // 4) 개화 (FLOWER 이미지가 있는 경우)
  const flowerImage = findImageByType(seed.id, 'FLOWER');
  if (flowerImage) {
    mockHistories.push({
      id: nextId(),
      plantId: seed.id,
      historyType: findCommonCode('HISTORY_TYPE', 'FLOWERING'),
      performedAt: daysAgo(Math.max(1, Math.floor(createdDaysAgo * 0.2))),
      performedBy: null,
      title: '개화',
      description: '꽃이 피었습니다.',
      amount: null,
      fromLocation: null,
      toLocation: null,
      image: { id: flowerImage.id, url: flowerImage.url },
      metadata: { flowerColor: rng() > 0.5 ? 'yellow' : 'white' },
    });
  }

  // 5) 판매 (SOLD 상태인 경우)
  if (seed.statusCode === 'SOLD' && seed.sellingPrice) {
    const saleImage = findImageByType(seed.id, 'SALE');
    mockHistories.push({
      id: nextId(),
      plantId: seed.id,
      historyType: findCommonCode('HISTORY_TYPE', 'SALE'),
      performedAt: daysAgo(Math.max(1, Math.floor(createdDaysAgo * 0.1))),
      performedBy: STAFF_NAMES[(seq + 1) % STAFF_NAMES.length],
      title: '판매',
      description: '고객 판매 완료',
      amount: seed.sellingPrice,
      fromLocation: null,
      toLocation: null,
      image: saleImage ? { id: saleImage.id, url: saleImage.url } : null,
      metadata: { paymentMethod: rng() > 0.5 ? 'CARD' : 'TRANSFER' },
    });
  }
}

export function historiesByPlantId(plantId: string): PlantHistory[] {
  return mockHistories
    .filter((h) => h.plantId === plantId)
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
}
