import type { TaxonRank } from '@prisma/client';

/**
 * CommonCode / PlantCategory / 개발용 테스트 데이터(Species, PlantLocation, Plant) 시드 데이터
 * prisma/seed.ts 에서 import하여 사용
 *
 * groupCode: PLANT_STATUS
 *   IN_STOCK, FOR_SALE, RESERVED, SOLD, DISCARDED
 *
 * groupCode: HISTORY_TYPE
 *   ACQUISITION, REPOT, SALE, LOCATION_CHANGE, FLOWERING, MEMO, WATERING, PROPAGATION
 *
 * groupCode: LOCATION_TYPE
 *   GREENHOUSE, ZONE, SHELF, DISPLAY, STORAGE
 *
 * groupCode: ORIGIN_TYPE (Plant.originType — 기존 enum 대체)
 *   PURCHASE, SEEDLING, CUTTING, OFFSET, GRAFT,
 *   EXCHANGE, DONATION, IMPORT, SEED_COLLECTED (향후 확장 코드 포함)
 *
 * PlantCategory (Species.categoryId, QR 접두사의 근거):
 *   CON, LTH, CAT, AFR, OTH
 *
 * SPECIES_SEEDS / LOCATION_SEEDS / PLANT_SEEDS:
 *   Plant CRUD API + Vue 화면을 FK 오류 없이 바로 테스트할 수 있도록 하는
 *   최소한의 개발용 데이터. id/code를 고정값으로 지정해 재실행(upsert) 시에도 안전하다.
 */
export const PLANT_CATEGORY_SEEDS = [
  { code: 'CON', name: 'Conophytum 계열', sortOrder: 1 },
  { code: 'LTH', name: 'Lithops 계열', sortOrder: 2 },
  { code: 'CAT', name: 'Cactus(선인장) 계열', sortOrder: 3 },
  { code: 'AFR', name: '아프리카 다육 계열', sortOrder: 4 },
  { code: 'OTH', name: '기타/미분류', sortOrder: 99 },
] as const;

export const COMMON_CODE_SEEDS = [
  // PLANT_STATUS
  { groupCode: 'PLANT_STATUS', code: 'IN_STOCK', name: '재고', sortOrder: 1 },
  { groupCode: 'PLANT_STATUS', code: 'FOR_SALE', name: '판매중', sortOrder: 2 },
  { groupCode: 'PLANT_STATUS', code: 'RESERVED', name: '예약', sortOrder: 3 },
  { groupCode: 'PLANT_STATUS', code: 'SOLD', name: '판매완료', sortOrder: 4 },
  { groupCode: 'PLANT_STATUS', code: 'DISCARDED', name: '폐기', sortOrder: 5 },

  // HISTORY_TYPE
  { groupCode: 'HISTORY_TYPE', code: 'ACQUISITION', name: '입고', sortOrder: 1 },
  { groupCode: 'HISTORY_TYPE', code: 'REPOT', name: '분갈이', sortOrder: 2 },
  { groupCode: 'HISTORY_TYPE', code: 'SALE', name: '판매', sortOrder: 3 },
  { groupCode: 'HISTORY_TYPE', code: 'LOCATION_CHANGE', name: '위치변경', sortOrder: 4 },
  { groupCode: 'HISTORY_TYPE', code: 'FLOWERING', name: '개화', sortOrder: 5 },
  { groupCode: 'HISTORY_TYPE', code: 'MEMO', name: '메모', sortOrder: 6 },
  { groupCode: 'HISTORY_TYPE', code: 'WATERING', name: '물주기', sortOrder: 7 },
  { groupCode: 'HISTORY_TYPE', code: 'PROPAGATION', name: '번식', sortOrder: 8 },

  // LOCATION_TYPE
  { groupCode: 'LOCATION_TYPE', code: 'GREENHOUSE', name: '온실', sortOrder: 1 },
  { groupCode: 'LOCATION_TYPE', code: 'ZONE', name: '구역', sortOrder: 2 },
  { groupCode: 'LOCATION_TYPE', code: 'SHELF', name: '선반', sortOrder: 3 },
  { groupCode: 'LOCATION_TYPE', code: 'DISPLAY', name: '전시', sortOrder: 4 },
  { groupCode: 'LOCATION_TYPE', code: 'STORAGE', name: '보관', sortOrder: 5 },

  // ORIGIN_TYPE (기존 Plant.originType enum → CommonCode 전환)
  { groupCode: 'ORIGIN_TYPE', code: 'PURCHASE', name: '구매', sortOrder: 1 },
  { groupCode: 'ORIGIN_TYPE', code: 'SEEDLING', name: '실생', sortOrder: 2 },
  { groupCode: 'ORIGIN_TYPE', code: 'CUTTING', name: '삽목', sortOrder: 3 },
  { groupCode: 'ORIGIN_TYPE', code: 'OFFSET', name: '분지', sortOrder: 4 },
  { groupCode: 'ORIGIN_TYPE', code: 'GRAFT', name: '접목', sortOrder: 5 },
  // 향후 확장 코드 (테이블 구조 변경 없이 코드 추가만으로 지원)
  { groupCode: 'ORIGIN_TYPE', code: 'EXCHANGE', name: '교환', sortOrder: 6 },
  { groupCode: 'ORIGIN_TYPE', code: 'DONATION', name: '나눔', sortOrder: 7 },
  { groupCode: 'ORIGIN_TYPE', code: 'IMPORT', name: '수입', sortOrder: 8 },
  { groupCode: 'ORIGIN_TYPE', code: 'SEED_COLLECTED', name: '채종', sortOrder: 9 },
] as const;

// PlantCategory 코드별 최소 1개 테스트 Species
// id를 고정값으로 지정해 upsert 시 동일 레코드를 재사용한다.
export const SPECIES_SEEDS: Array<{
  id: string;
  categoryCode: (typeof PLANT_CATEGORY_SEEDS)[number]['code'];
  displayName: string;
  englishName: string | null;
  taxonRank: TaxonRank;
}> = [
  {
    id: 'seed-species-con',
    categoryCode: 'CON',
    displayName: 'Conophytum test species',
    englishName: 'Conophytum sp.',
    taxonRank: 'SP',
  },
  {
    id: 'seed-species-lth',
    categoryCode: 'LTH',
    displayName: 'Lithops test species',
    englishName: 'Lithops sp.',
    taxonRank: 'SP',
  },
  {
    id: 'seed-species-cat',
    categoryCode: 'CAT',
    displayName: 'Cactus test species',
    englishName: 'Cactus sp.',
    taxonRank: 'SPECIES',
  },
  {
    id: 'seed-species-afr',
    categoryCode: 'AFR',
    displayName: 'African succulent test species',
    englishName: 'African succulent sp.',
    taxonRank: 'SPECIES',
  },
  {
    id: 'seed-species-oth',
    categoryCode: 'OTH',
    displayName: 'Misc species',
    englishName: null,
    taxonRank: 'SP',
  },
];

// 테스트용 최소 위치 데이터 (GREENHOUSE 기본 위치 / DISPLAY 위치)
// code는 PlantLocation.code(@unique)에 매핑되어 upsert 기준으로 사용된다.
export const LOCATION_SEEDS = [
  { code: 'SEED-GREENHOUSE-01', name: '기본 온실', typeCode: 'GREENHOUSE' },
  { code: 'SEED-DISPLAY-01', name: '기본 전시대', typeCode: 'DISPLAY' },
] as const;

// Plant CRUD API 즉시 테스트용 개체 3건
// status=IN_STOCK, originType=PURCHASE, deletedAt=null 고정
export const PLANT_SEEDS = [
  { id: 'seed-plant-1', nickname: 'Test Plant 1', speciesId: 'seed-species-con', locationCode: 'SEED-GREENHOUSE-01' },
  { id: 'seed-plant-2', nickname: 'Test Plant 2', speciesId: 'seed-species-lth', locationCode: 'SEED-GREENHOUSE-01' },
  { id: 'seed-plant-3', nickname: 'Test Plant 3', speciesId: 'seed-species-cat', locationCode: 'SEED-DISPLAY-01' },
] as const;

// 멀티유저 SaaS RBAC 검증용 계정.
// id를 고정값으로 지정해 upsert 시 동일 계정을 재사용하고, 비밀번호는 seed.ts에서 bcrypt로 해싱한다.
// 실서비스 배포 전 반드시 SYSTEM ADMIN 비밀번호를 변경해야 한다.
export const USER_SEEDS = [
  {
    id: 'seed-user-admin',
    email: 'admin@ask-plant.local',
    password: 'admin1234!',
    name: 'SYSTEM ADMIN',
    phone: null,
    role: 'ADMIN' as const,
  },
  {
    id: 'seed-user-customer',
    email: 'customer@ask-plant.local',
    password: 'customer1234!',
    name: 'Test Customer',
    phone: null,
    role: 'CUSTOMER' as const,
  },
] as const;
