import type { PlantLocation } from '@/types/location';
import { findCommonCode } from './commonCodes.mock';

interface LocationSeed {
  id: string;
  code: string;
  name: string;
  typeCode: string;
  parentId: string | null;
  imagePath: string | null;
  posX: number | null;
  posY: number | null;
}

const SEEDS: LocationSeed[] = [
  { id: 'loc-gh-a', code: 'GH-A', name: '온실 A', typeCode: 'GREENHOUSE', parentId: null, imagePath: '/mock/map-greenhouse-a.svg', posX: null, posY: null },
  { id: 'loc-gh-a-z1', code: 'GH-A-Z1', name: '1구역', typeCode: 'ZONE', parentId: 'loc-gh-a', imagePath: null, posX: 0.25, posY: 0.3 },
  { id: 'loc-gh-a-z1-s1', code: 'GH-A-Z1-S1', name: '1번 선반', typeCode: 'SHELF', parentId: 'loc-gh-a-z1', imagePath: null, posX: 0.22, posY: 0.28 },
  { id: 'loc-gh-a-z1-s2', code: 'GH-A-Z1-S2', name: '2번 선반', typeCode: 'SHELF', parentId: 'loc-gh-a-z1', imagePath: null, posX: 0.28, posY: 0.32 },
  { id: 'loc-gh-a-z2', code: 'GH-A-Z2', name: '2구역', typeCode: 'ZONE', parentId: 'loc-gh-a', imagePath: null, posX: 0.7, posY: 0.4 },
  { id: 'loc-gh-a-z2-s1', code: 'GH-A-Z2-S1', name: '1번 선반', typeCode: 'SHELF', parentId: 'loc-gh-a-z2', imagePath: null, posX: 0.68, posY: 0.38 },
  { id: 'loc-gh-b', code: 'GH-B', name: '온실 B', typeCode: 'GREENHOUSE', parentId: null, imagePath: '/mock/map-greenhouse-b.svg', posX: null, posY: null },
  { id: 'loc-gh-b-z1', code: 'GH-B-Z1', name: '1구역', typeCode: 'ZONE', parentId: 'loc-gh-b', imagePath: null, posX: 0.3, posY: 0.5 },
  { id: 'loc-gh-b-z1-s1', code: 'GH-B-Z1-S1', name: '1번 선반', typeCode: 'SHELF', parentId: 'loc-gh-b-z1', imagePath: null, posX: 0.28, posY: 0.48 },
  { id: 'loc-gh-b-z1-s2', code: 'GH-B-Z1-S2', name: '2번 선반', typeCode: 'SHELF', parentId: 'loc-gh-b-z1', imagePath: null, posX: 0.32, posY: 0.52 },
  { id: 'loc-gh-b-display', code: 'GH-B-DP', name: '전시대', typeCode: 'DISPLAY', parentId: 'loc-gh-b', imagePath: null, posX: 0.6, posY: 0.6 },
  { id: 'loc-storage', code: 'ST-01', name: '창고', typeCode: 'STORAGE', parentId: null, imagePath: null, posX: null, posY: null },
];

function computeDepth(id: string, map: Map<string, LocationSeed>): number {
  let depth = 0;
  let current = map.get(id);
  while (current?.parentId) {
    depth += 1;
    current = map.get(current.parentId);
  }
  return depth;
}

const seedMap = new Map(SEEDS.map((s) => [s.id, s]));

export const mockLocations: PlantLocation[] = SEEDS.map((seed) => ({
  id: seed.id,
  code: seed.code,
  name: seed.name,
  type: findCommonCode('LOCATION_TYPE', seed.typeCode),
  parentId: seed.parentId,
  parentName: seed.parentId ? (seedMap.get(seed.parentId)?.name ?? null) : null,
  imagePath: seed.imagePath,
  posX: seed.posX,
  posY: seed.posY,
  depth: computeDepth(seed.id, seedMap),
  plantCount: 0,
}));

/** 개체 등록에 실제로 사용 가능한 하위(말단) 위치 목록 — 온실/구역은 그룹 노드이므로 제외 */
export const leafLocationIds = SEEDS.filter((s) => ['SHELF', 'DISPLAY', 'STORAGE'].includes(s.typeCode)).map((s) => s.id);

export function findLocation(id: string | null): PlantLocation | null {
  if (!id) return null;
  return mockLocations.find((l) => l.id === id) ?? null;
}
