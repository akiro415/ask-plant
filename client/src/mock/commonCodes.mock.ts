import type { CommonCode } from '@/types/common';

let seq = 0;
function code(groupCode: string, code: string, name: string, sortOrder: number): CommonCode {
  seq += 1;
  return { id: `cc-${seq}`, groupCode, code, name, sortOrder };
}

export const mockCommonCodes: CommonCode[] = [
  // PLANT_STATUS
  code('PLANT_STATUS', 'IN_STOCK', '재고', 1),
  code('PLANT_STATUS', 'FOR_SALE', '판매중', 2),
  code('PLANT_STATUS', 'RESERVED', '예약', 3),
  code('PLANT_STATUS', 'SOLD', '판매완료', 4),
  code('PLANT_STATUS', 'DISCARDED', '폐기', 5),

  // HISTORY_TYPE
  code('HISTORY_TYPE', 'ACQUISITION', '입고', 1),
  code('HISTORY_TYPE', 'REPOT', '분갈이', 2),
  code('HISTORY_TYPE', 'SALE', '판매', 3),
  code('HISTORY_TYPE', 'LOCATION_CHANGE', '위치변경', 4),
  code('HISTORY_TYPE', 'FLOWERING', '개화', 5),
  code('HISTORY_TYPE', 'MEMO', '메모', 6),
  code('HISTORY_TYPE', 'WATERING', '물주기', 7),
  code('HISTORY_TYPE', 'PROPAGATION', '번식', 8),

  // LOCATION_TYPE
  code('LOCATION_TYPE', 'GREENHOUSE', '온실', 1),
  code('LOCATION_TYPE', 'ZONE', '구역', 2),
  code('LOCATION_TYPE', 'SHELF', '선반', 3),
  code('LOCATION_TYPE', 'DISPLAY', '전시', 4),
  code('LOCATION_TYPE', 'STORAGE', '보관', 5),

  // ORIGIN_TYPE
  code('ORIGIN_TYPE', 'PURCHASE', '구매', 1),
  code('ORIGIN_TYPE', 'SEEDLING', '실생', 2),
  code('ORIGIN_TYPE', 'CUTTING', '삽목', 3),
  code('ORIGIN_TYPE', 'OFFSET', '분지', 4),
  code('ORIGIN_TYPE', 'GRAFT', '접목', 5),
  code('ORIGIN_TYPE', 'EXCHANGE', '교환', 6),
  code('ORIGIN_TYPE', 'DONATION', '나눔', 7),
  code('ORIGIN_TYPE', 'IMPORT', '수입', 8),
  code('ORIGIN_TYPE', 'SEED_COLLECTED', '채종', 9),
];

export function findCommonCode(groupCode: string, codeValue: string): CommonCode {
  const found = mockCommonCodes.find((c) => c.groupCode === groupCode && c.code === codeValue);
  if (!found) throw new Error(`CommonCode not found: ${groupCode}.${codeValue}`);
  return found;
}

export function codesByGroup(groupCode: string): CommonCode[] {
  return mockCommonCodes.filter((c) => c.groupCode === groupCode).sort((a, b) => a.sortOrder - b.sortOrder);
}
