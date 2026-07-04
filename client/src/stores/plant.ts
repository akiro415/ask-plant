import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { PlantSummary } from '@/types/plant';
import { mockPlantSummaries, getPlantDetail, getChildPlants } from '@/mock';

export const usePlantStore = defineStore('plant', () => {
  const plants = ref<PlantSummary[]>(mockPlantSummaries);

  const searchQuery = ref('');
  const statusFilter = ref<string>('');
  const categoryFilter = ref<string>('');
  const page = ref(1);
  const pageSize = ref(10);

  const filtered = computed(() => {
    return plants.value.filter((p) => {
      const matchesQuery = searchQuery.value
        ? [p.qrCode, p.nickname ?? '', p.species.displayName, p.species.scientificName ?? '']
            .join(' ')
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase())
        : true;
      const matchesStatus = statusFilter.value ? p.status.code === statusFilter.value : true;
      const matchesCategory = categoryFilter.value ? p.species.category?.code === categoryFilter.value : true;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  });

  const total = computed(() => filtered.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

  const pagedPlants = computed(() => {
    const start = (page.value - 1) * pageSize.value;
    return filtered.value.slice(start, start + pageSize.value);
  });

  function setSearch(value: string) {
    searchQuery.value = value;
    page.value = 1;
  }

  function setStatusFilter(value: string) {
    statusFilter.value = value;
    page.value = 1;
  }

  function setCategoryFilter(value: string) {
    categoryFilter.value = value;
    page.value = 1;
  }

  function setPage(value: number) {
    page.value = value;
  }

  function getDetail(id: string) {
    return getPlantDetail(id);
  }

  function getChildren(id: string) {
    return getChildPlants(id);
  }

  return {
    plants,
    searchQuery,
    statusFilter,
    categoryFilter,
    page,
    pageSize,
    filtered,
    total,
    totalPages,
    pagedPlants,
    setSearch,
    setStatusFilter,
    setCategoryFilter,
    setPage,
    getDetail,
    getChildren,
  };
});
