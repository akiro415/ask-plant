import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { PlantLocation } from '@/types/location';
import {
  fetchLocations,
  createLocation as createLocationApi,
  updateLocation as updateLocationApi,
  deleteLocation as deleteLocationApi,
  type LocationApiRow,
  type CreateLocationPayload,
  type UpdateLocationPayload,
} from '@/api/location.api';
import { fetchCommonCodes } from '@/api/common-code.api';
import type { CommonCode } from '@/types/common';
import { extractErrorMessage } from '@/api/http';
import { usePlantStore } from './plant';

/** parentId 기준으로 루트부터 DFS 순서로 정렬하며 depth(들여쓰기 단계)를 함께 계산한다. */
function buildOrderedTree(rows: LocationApiRow[]): { row: LocationApiRow; depth: number }[] {
  const childrenByParent = new Map<string | null, LocationApiRow[]>();
  for (const row of rows) {
    const key = row.parentId;
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key)!.push(row);
  }
  for (const group of childrenByParent.values()) {
    group.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }

  const result: { row: LocationApiRow; depth: number }[] = [];
  const visited = new Set<string>();

  function visit(parentId: string | null, depth: number) {
    for (const row of childrenByParent.get(parentId) ?? []) {
      if (visited.has(row.id)) continue; // 방어적 순환 참조 처리
      visited.add(row.id);
      result.push({ row, depth });
      visit(row.id, depth + 1);
    }
  }

  visit(null, 0);
  // 고아 노드(상위가 목록에 없거나 비활성화된 경우) 방어적으로 뒤에 추가
  for (const row of rows) {
    if (!visited.has(row.id)) {
      visited.add(row.id);
      result.push({ row, depth: 0 });
    }
  }

  return result;
}

export const useLocationStore = defineStore('location', () => {
  const rawRows = ref<LocationApiRow[]>([]);
  const listLoading = ref(false);
  const listError = ref<string | null>(null);
  const listLoaded = ref(false);

  const formLoading = ref(false);
  const formError = ref<string | null>(null);
  const deleteLoadingId = ref<string | null>(null);
  const deleteError = ref<string | null>(null);

  /** 위치 등록/수정 폼의 "위치 유형" select 옵션(CommonCode groupCode: LOCATION_TYPE) */
  const typeOptions = ref<CommonCode[]>([]);
  const typeOptionsLoaded = ref(false);

  const locations = computed<PlantLocation[]>(() => {
    const plantStore = usePlantStore();
    const plantCountByLocation = new Map<string, number>();
    for (const p of plantStore.plants) {
      if (p.location) {
        plantCountByLocation.set(p.location.id, (plantCountByLocation.get(p.location.id) ?? 0) + 1);
      }
    }

    return buildOrderedTree(rawRows.value).map(({ row, depth }) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type,
      parentId: row.parentId,
      parentName: row.parent?.name ?? null,
      imagePath: row.imagePath,
      posX: row.posX,
      posY: row.posY,
      depth,
      plantCount: plantCountByLocation.get(row.id) ?? 0,
    }));
  });

  function findById(id: string) {
    return locations.value.find((l) => l.id === id) ?? null;
  }

  function children(parentId: string | null) {
    return locations.value.filter((l) => l.parentId === parentId);
  }

  /** GET /api/v1/locations */
  async function fetchLocationList() {
    listLoading.value = true;
    listError.value = null;
    try {
      const rows = await fetchLocations();
      rawRows.value = rows;
      listLoaded.value = true;
    } catch (error) {
      listError.value = extractErrorMessage(error, '위치 목록을 불러오지 못했습니다');
    } finally {
      listLoading.value = false;
    }
  }

  async function ensureLocationsLoaded() {
    if (!listLoaded.value && !listLoading.value) {
      await fetchLocationList();
    }
  }

  /** 위치 등록/수정 폼이 열릴 때 최초 1회만 위치유형 옵션을 불러온다(GET /common-codes?groupCode=LOCATION_TYPE). */
  async function ensureTypeOptionsLoaded() {
    if (typeOptionsLoaded.value) return;
    try {
      typeOptions.value = await fetchCommonCodes('LOCATION_TYPE');
      typeOptionsLoaded.value = true;
    } catch {
      // 위치유형 옵션은 보조 데이터이므로 실패해도 폼 자체는 계속 사용 가능하게 둔다.
    }
  }

  /** POST /api/v1/locations — 성공 시 목록을 다시 조회해 트리(buildOrderedTree)가 최신 상태로 재계산되게 한다. */
  async function createLocation(payload: CreateLocationPayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await createLocationApi(payload);
      await fetchLocationList();
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '위치 등록에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** PUT /api/v1/locations/:id — 성공 시 목록을 다시 조회해 트리(buildOrderedTree)가 최신 상태로 재계산되게 한다. */
  async function updateLocation(id: string, payload: UpdateLocationPayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await updateLocationApi(id, payload);
      await fetchLocationList();
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '위치 수정에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** DELETE /api/v1/locations/:id — 서버가 isActive=false로 Soft Delete 처리 후 목록을 다시 조회한다. */
  async function deleteLocation(id: string): Promise<boolean> {
    deleteLoadingId.value = id;
    deleteError.value = null;
    try {
      await deleteLocationApi(id);
      await fetchLocationList();
      return true;
    } catch (error) {
      deleteError.value = extractErrorMessage(error, '위치 삭제에 실패했습니다');
      return false;
    } finally {
      deleteLoadingId.value = null;
    }
  }

  return {
    locations,
    listLoading,
    listError,
    formLoading,
    formError,
    deleteLoadingId,
    deleteError,
    typeOptions,
    findById,
    children,
    fetchLocationList,
    ensureLocationsLoaded,
    ensureTypeOptionsLoaded,
    createLocation,
    updateLocation,
    deleteLocation,
  };
});
