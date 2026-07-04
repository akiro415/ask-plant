import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PlantLocation } from '@/types/location';
import { mockLocations } from '@/mock';

export const useLocationStore = defineStore('location', () => {
  const locations = ref<PlantLocation[]>(mockLocations);

  function findById(id: string) {
    return locations.value.find((l) => l.id === id) ?? null;
  }

  function children(parentId: string | null) {
    return locations.value.filter((l) => l.parentId === parentId);
  }

  return { locations, findById, children };
});
