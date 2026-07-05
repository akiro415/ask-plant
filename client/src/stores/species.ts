import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Species } from '@/types/species';
import {
  fetchSpeciesList,
  createSpecies as createSpeciesApi,
  updateSpecies as updateSpeciesApi,
  deleteSpecies as deleteSpeciesApi,
  type SpeciesListItem,
  type CreateSpeciesPayload,
  type UpdateSpeciesPayload,
} from '@/api/species.api';
import { extractErrorMessage } from '@/api/http';
import { usePlantStore } from './plant';

function toSpecies(item: SpeciesListItem): Species {
  return {
    id: item.id,
    displayName: item.displayName,
    scientificName: item.scientificName,
    englishName: item.englishName,
    koreanName: item.koreanName,
    fieldNumber: item.fieldNumber,
    sellerName: item.sellerName,
    taxonRank: item.taxonRank,
    isHybrid: item.isHybrid,
    parentSpecies1Id: item.parentSpecies1Id,
    parentSpecies2Id: item.parentSpecies2Id,
    category: item.category,
    genus: item.genus,
    family: item.family,
    careGuide: item.careGuide,
    defaultWateringCycleDays: item.defaultWateringCycleDays,
    thumbnailUrl: item.thumbnailUrl,
    // 개체 수는 GET /species 응답에 포함되지 않아 plantStore(GET /plants) 데이터로 별도 계산한다.
    plantCount: 0,
    createdAt: item.createdAt,
  };
}

export const useSpeciesStore = defineStore('species', () => {
  const rawSpeciesList = ref<Species[]>([]);
  const listLoading = ref(false);
  const listError = ref<string | null>(null);
  const listLoaded = ref(false);

  const searchQuery = ref('');
  const categoryFilter = ref('');

  const formLoading = ref(false);
  const formError = ref<string | null>(null);
  const deleteLoadingId = ref<string | null>(null);
  const deleteError = ref<string | null>(null);

  /**
   * 개체 수(plantCount)는 GET /species 응답에 없어 plantStore(GET /plants)의 데이터로 계산해 합성한다.
   * plantStore가 아직 로드되지 않았다면 0으로 표시되고, 로드가 끝나면 반응형으로 갱신된다.
   */
  const speciesList = computed<Species[]>(() => {
    const plantStore = usePlantStore();
    const countMap = new Map<string, number>();
    for (const p of plantStore.plants) {
      countMap.set(p.species.id, (countMap.get(p.species.id) ?? 0) + 1);
    }
    return rawSpeciesList.value.map((s) => ({ ...s, plantCount: countMap.get(s.id) ?? 0 }));
  });

  const filtered = computed(() => {
    return speciesList.value.filter((s) => {
      const haystack = [s.displayName, s.scientificName, s.englishName, s.koreanName, s.fieldNumber, s.sellerName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesQuery = searchQuery.value ? haystack.includes(searchQuery.value.toLowerCase()) : true;
      const matchesCategory = categoryFilter.value ? s.category?.code === categoryFilter.value : true;
      return matchesQuery && matchesCategory;
    });
  });

  /** 카테고리 필터 옵션 — 별도 PlantCategory API가 없어 조회된 품종에서 실제 등장한 카테고리만 추출한다. */
  const categoryOptions = computed(() => {
    const map = new Map<string, { code: string; name: string }>();
    for (const s of speciesList.value) {
      if (s.category && !map.has(s.category.code)) {
        map.set(s.category.code, { code: s.category.code, name: s.category.name });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  });

  /** 등록/수정 폼의 카테고리 select 옵션 — 별도 PlantCategory API가 없어 조회된 품종에서 실제 등장한 카테고리(id 포함)를 추출한다. */
  const categoryChoices = computed(() => {
    const map = new Map<string, { id: string; code: string; name: string }>();
    for (const s of rawSpeciesList.value) {
      if (s.category && !map.has(s.category.id)) {
        map.set(s.category.id, s.category);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  });

  function setSearch(value: string) {
    searchQuery.value = value;
  }

  function setCategoryFilter(value: string) {
    categoryFilter.value = value;
  }

  function findById(id: string) {
    return speciesList.value.find((s) => s.id === id) ?? null;
  }

  /** GET /api/v1/species */
  async function fetchSpecies() {
    listLoading.value = true;
    listError.value = null;
    try {
      const items = await fetchSpeciesList();
      rawSpeciesList.value = items.map(toSpecies);
      listLoaded.value = true;
    } catch (error) {
      listError.value = extractErrorMessage(error, '품종 목록을 불러오지 못했습니다');
    } finally {
      listLoading.value = false;
    }
  }

  /** SpeciesDetailView 등에서 목록 화면을 거치지 않고 바로 진입해도 데이터가 보이도록 최초 1회 로드를 보장한다. */
  async function ensureSpeciesLoaded() {
    if (!listLoaded.value && !listLoading.value) {
      await fetchSpecies();
    }
  }

  /** POST /api/v1/species — 성공 시 목록을 다시 조회해 최신 상태를 반영한다. */
  async function createSpecies(payload: CreateSpeciesPayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await createSpeciesApi(payload);
      await fetchSpecies();
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '품종 등록에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** PUT /api/v1/species/:id — 성공 시 목록을 다시 조회해 최신 상태를 반영한다. */
  async function updateSpecies(id: string, payload: UpdateSpeciesPayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await updateSpeciesApi(id, payload);
      await fetchSpecies();
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '품종 수정에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** DELETE /api/v1/species/:id — 서버가 isActive=false로 Soft Delete 처리 후 목록을 다시 조회한다. */
  async function deleteSpecies(id: string): Promise<boolean> {
    deleteLoadingId.value = id;
    deleteError.value = null;
    try {
      await deleteSpeciesApi(id);
      await fetchSpecies();
      return true;
    } catch (error) {
      deleteError.value = extractErrorMessage(error, '품종 삭제에 실패했습니다');
      return false;
    } finally {
      deleteLoadingId.value = null;
    }
  }

  return {
    speciesList,
    listLoading,
    listError,
    searchQuery,
    categoryFilter,
    filtered,
    categoryOptions,
    categoryChoices,
    formLoading,
    formError,
    deleteLoadingId,
    deleteError,
    setSearch,
    setCategoryFilter,
    findById,
    fetchSpecies,
    ensureSpeciesLoaded,
    createSpecies,
    updateSpecies,
    deleteSpecies,
  };
});
