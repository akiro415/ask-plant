import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Species } from '@/types/species';
import { mockSpeciesList } from '@/mock';

export const useSpeciesStore = defineStore('species', () => {
  const speciesList = ref<Species[]>(mockSpeciesList);
  const searchQuery = ref('');
  const categoryFilter = ref('');

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

  function setSearch(value: string) {
    searchQuery.value = value;
  }

  function setCategoryFilter(value: string) {
    categoryFilter.value = value;
  }

  function findById(id: string) {
    return speciesList.value.find((s) => s.id === id) ?? null;
  }

  return { speciesList, searchQuery, categoryFilter, filtered, setSearch, setCategoryFilter, findById };
});
