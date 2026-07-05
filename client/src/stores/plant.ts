import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { PlantDetail, PlantSummary } from '@/types/plant';
import { plantApi, type CreatePlantPayload, type UpdatePlantPayload } from '@/api/plant.api';
import { fetchSpeciesOptions, type SpeciesOption } from '@/api/species.api';
import { fetchCommonCodes } from '@/api/common-code.api';
import type { CommonCode } from '@/types/common';
import { extractErrorMessage } from '@/api/http';
import { useAuthStore } from './auth';

export const usePlantStore = defineStore('plant', () => {
  const auth = useAuthStore();
  const plants = ref<PlantSummary[]>([]);
  const listLoading = ref(false);
  const listError = ref<string | null>(null);
  const listLoaded = ref(false);

  const currentPlant = ref<PlantDetail | null>(null);
  const detailLoading = ref(false);
  const detailError = ref<string | null>(null);

  const createLoading = ref(false);
  const createError = ref<string | null>(null);

  const updateLoading = ref(false);
  const updateError = ref<string | null>(null);

  const deleteLoading = ref(false);
  const deleteError = ref<string | null>(null);

  const searchQuery = ref('');
  const ownerSearchQuery = ref('');
  const statusFilter = ref<string>('');
  const categoryFilter = ref<string>('');
  const page = ref(1);
  const pageSize = ref(10);

  // 목록 필터(상태/카테고리) 드롭다운을 채우기 위한 실 API 데이터 — mock 대체용.
  const statusOptions = ref<CommonCode[]>([]);
  const speciesOptions = ref<SpeciesOption[]>([]);
  const filterOptionsLoaded = ref(false);

  /** speciesId → categoryCode. GET /plants 응답에 species.category가 없어 GET /species로 보강한다. */
  const speciesCategoryMap = computed(() => {
    const map = new Map<string, string>();
    for (const s of speciesOptions.value) {
      if (s.category) map.set(s.id, s.category.code);
    }
    return map;
  });

  const categoryOptions = computed(() => {
    const map = new Map<string, { code: string; name: string }>();
    for (const s of speciesOptions.value) {
      if (s.category && !map.has(s.category.code)) {
        map.set(s.category.code, { code: s.category.code, name: s.category.name });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  });

  const filtered = computed(() => {
    return plants.value.filter((p) => {
      const matchesQuery = searchQuery.value
        ? [p.qrCode, p.nickname ?? '', p.species.displayName, p.species.scientificName ?? '']
            .join(' ')
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase())
        : true;
      const matchesStatus = statusFilter.value ? p.status.code === statusFilter.value : true;
      const matchesCategory = categoryFilter.value ? speciesCategoryMap.value.get(p.species.id) === categoryFilter.value : true;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  });

  const total = computed(() => filtered.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

  const pagedPlants = computed(() => {
    const start = (page.value - 1) * pageSize.value;
    return filtered.value.slice(start, start + pageSize.value);
  });

  function setOwnerSearch(value: string) {
    ownerSearchQuery.value = value;
    page.value = 1;
    void fetchPlants();
  }

  function setStatusFilter(value: string) {
    statusFilter.value = value;
    page.value = 1;
    void fetchPlants();
  }

  function setCategoryFilter(value: string) {
    categoryFilter.value = value;
    page.value = 1;
  }

  function setSearch(value: string) {
    searchQuery.value = value;
    page.value = 1;
    void fetchPlants();
  }

  function setPage(value: number) {
    page.value = value;
  }

  /** GET /api/v1/plants — 화면에서 자체 검색/필터/페이지네이션을 유지하기 위해 넉넉한 limit으로 전체를 가져온다. */
  async function fetchPlants() {
    listLoading.value = true;
    listError.value = null;
    try {
      const params: Parameters<typeof plantApi.list>[0] = {
        limit: 100,
        sort: 'createdAt',
        order: 'desc',
      };
      if (searchQuery.value.trim()) params.q = searchQuery.value.trim();
      if (statusFilter.value) params.status = statusFilter.value;
      if (auth.hasRole('ADMIN', 'STAFF') && ownerSearchQuery.value.trim()) {
        params.ownerQ = ownerSearchQuery.value.trim();
      }
      const { items } = await plantApi.list(params);
      plants.value = items;
      listLoaded.value = true;
    } catch (error) {
      listError.value = extractErrorMessage(error, '개체 목록을 불러오지 못했습니다');
    } finally {
      listLoading.value = false;
    }
  }

  /** SpeciesDetailView 등 다른 화면이 plants 상태를 참조할 때, 아직 로드되지 않았다면 최초 1회 조회한다. */
  async function ensurePlantsLoaded() {
    if (!listLoaded.value && !listLoading.value) {
      await fetchPlants();
    }
  }

  /** 목록 화면의 상태/카테고리 필터 드롭다운용 데이터를 최초 1회만 불러온다(GET /common-codes, GET /species). */
  async function ensureFilterOptionsLoaded() {
    if (filterOptionsLoaded.value) return;
    try {
      const [statuses, species] = await Promise.all([fetchCommonCodes('PLANT_STATUS'), fetchSpeciesOptions()]);
      statusOptions.value = statuses;
      speciesOptions.value = species;
      filterOptionsLoaded.value = true;
    } catch {
      // 필터 옵션은 목록 조회 자체를 막지 않는 보조 데이터이므로 실패해도 화면은 계속 사용 가능하게 둔다.
    }
  }

  async function fetchPlantById(id: string) {
    detailLoading.value = true;
    detailError.value = null;
    currentPlant.value = null;
    try {
      currentPlant.value = await plantApi.getById(id);
    } catch (error) {
      detailError.value = extractErrorMessage(error, '개체 정보를 불러오지 못했습니다');
    } finally {
      detailLoading.value = false;
    }
  }

  async function createPlant(payload: CreatePlantPayload): Promise<PlantDetail | null> {
    createLoading.value = true;
    createError.value = null;
    try {
      const created = await plantApi.create(payload);
      plants.value = [created, ...plants.value];
      return created;
    } catch (error) {
      createError.value = extractErrorMessage(error, '개체 등록에 실패했습니다');
      return null;
    } finally {
      createLoading.value = false;
    }
  }

  /** PUT /api/v1/plants/:id */
  async function updatePlant(id: string, payload: UpdatePlantPayload): Promise<boolean> {
    updateLoading.value = true;
    updateError.value = null;
    try {
      const updated = await plantApi.update(id, payload);
      currentPlant.value = updated;
      plants.value = plants.value.map((p) => (p.id === id ? { ...p, ...updated } : p));
      return true;
    } catch (error) {
      updateError.value = extractErrorMessage(error, '개체 수정에 실패했습니다');
      return false;
    } finally {
      updateLoading.value = false;
    }
  }

  /** DELETE /api/v1/plants/:id — soft delete */
  async function deletePlant(id: string): Promise<boolean> {
    deleteLoading.value = true;
    deleteError.value = null;
    try {
      await plantApi.remove(id);
      plants.value = plants.value.filter((p) => p.id !== id);
      if (currentPlant.value?.id === id) currentPlant.value = null;
      return true;
    } catch (error) {
      deleteError.value = extractErrorMessage(error, '개체 삭제에 실패했습니다');
      return false;
    } finally {
      deleteLoading.value = false;
    }
  }

  /** 자식 개체 조회 API가 아직 없어 항상 빈 배열을 반환한다 (알려진 제약사항). */
  function getChildren(_parentId: string): PlantSummary[] {
    return [];
  }

  return {
    plants,
    listLoading,
    listError,
    currentPlant,
    detailLoading,
    detailError,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    searchQuery,
    ownerSearchQuery,
    statusFilter,
    categoryFilter,
    statusOptions,
    categoryOptions,
    page,
    pageSize,
    filtered,
    total,
    totalPages,
    pagedPlants,
    setSearch,
    setOwnerSearch,
    setStatusFilter,
    setCategoryFilter,
    setPage,
    fetchPlants,
    ensurePlantsLoaded,
    ensureFilterOptionsLoaded,
    fetchPlantById,
    createPlant,
    updatePlant,
    deletePlant,
    getChildren,
  };
});
