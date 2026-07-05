import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { DashboardRecentHistoryItem, DashboardRecentImageItem } from '@/types/dashboard';
import { fetchDashboardSummary, type DashboardSummaryDto } from '@/api/dashboard.api';
import { fetchRecentHistories } from '@/api/history.api';
import { fetchRecentImages } from '@/api/image.api';
import { extractErrorMessage } from '@/api/http';

export const useDashboardStore = defineStore('dashboard', () => {
  const recentLimit = ref(5);
  const statsLoading = ref(false);
  const statsError = ref<string | null>(null);
  const statsLoaded = ref(false);

  const summary = ref<DashboardSummaryDto | null>(null);
  const recentRepots = ref<DashboardRecentHistoryItem[]>([]);
  const recentSales = ref<DashboardRecentHistoryItem[]>([]);
  const recentImages = ref<DashboardRecentImageItem[]>([]);

  /** GET /api/v1/dashboard + /histories/recent + /images/recent — 통계와 최근 목록을 병렬로 조회한다. */
  async function fetchStats() {
    statsLoading.value = true;
    statsError.value = null;
    try {
      const [dashboardData, repots, sales, images] = await Promise.all([
        fetchDashboardSummary(),
        fetchRecentHistories('REPOT', recentLimit.value),
        fetchRecentHistories('SALE', recentLimit.value),
        fetchRecentImages(recentLimit.value),
      ]);
      summary.value = dashboardData;
      recentRepots.value = repots;
      recentSales.value = sales;
      recentImages.value = images;
      statsLoaded.value = true;
    } catch (error) {
      statsError.value = extractErrorMessage(error, '대시보드 데이터를 불러오지 못했습니다');
    } finally {
      statsLoading.value = false;
    }
  }

  const recentPart = computed(() => ({
    recentRepots: recentRepots.value,
    recentSales: recentSales.value,
    recentImages: recentImages.value,
  }));

  return { recentLimit, statsLoading, statsError, statsLoaded, summary, recentPart, fetchStats };
});
