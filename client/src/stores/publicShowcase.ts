import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { PublicPlantListItem } from '@/types/public';
import { fetchPublicPlants } from '@/api/public.api';
import { extractErrorMessage } from '@/api/http';

export interface ShowcaseFilters {
  categoryId: string;
  speciesId: string;
  status: string;
  q: string;
  page: number;
}

export const usePublicShowcaseStore = defineStore('publicShowcase', () => {
  const items = ref<PublicPlantListItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const filters = ref<ShowcaseFilters>({
    categoryId: '',
    speciesId: '',
    status: 'FOR_SALE',
    q: '',
    page: 1,
  });

  const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const categoryOptions = computed(() => {
    const map = new Map<string, { id: string; code: string; name: string }>();
    for (const item of items.value) {
      const cat = item.species.category;
      if (cat) map.set(cat.id, cat);
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  });

  const hasMore = computed(() => filters.value.page < meta.value.totalPages);

  async function fetchList(append = false) {
    loading.value = true;
    error.value = null;
    try {
      const params = {
        page: filters.value.page,
        limit: 20,
        status: filters.value.status || 'FOR_SALE',
        ...(filters.value.categoryId ? { categoryId: filters.value.categoryId } : {}),
        ...(filters.value.speciesId ? { speciesId: filters.value.speciesId } : {}),
        ...(filters.value.q.trim() ? { q: filters.value.q.trim() } : {}),
      };
      const result = await fetchPublicPlants(params);
      items.value = append ? [...items.value, ...result.items] : result.items;
      meta.value = result.meta;
    } catch (err) {
      error.value = extractErrorMessage(err, '판매 목록을 불러오지 못했습니다');
      if (!append) items.value = [];
    } finally {
      loading.value = false;
    }
  }

  function setFilter(partial: Partial<ShowcaseFilters>) {
    filters.value = { ...filters.value, ...partial, page: partial.page ?? 1 };
  }

  function applyFilters() {
    filters.value.page = 1;
    return fetchList(false);
  }

  function loadMore() {
    if (!hasMore.value || loading.value) return;
    filters.value.page += 1;
    return fetchList(true);
  }

  return {
    items,
    loading,
    error,
    filters,
    meta,
    categoryOptions,
    hasMore,
    fetchList,
    setFilter,
    applyFilters,
    loadMore,
  };
});
