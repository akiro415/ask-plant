import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { buildDashboardSummary } from '@/mock/dashboard.mock';

export const useDashboardStore = defineStore('dashboard', () => {
  const recentLimit = ref(5);
  const summary = computed(() => buildDashboardSummary(recentLimit.value));

  return { recentLimit, summary };
});
