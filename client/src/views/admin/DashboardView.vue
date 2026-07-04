<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useDashboardStore } from '@/stores/dashboard';
import { findCommonCode } from '@/mock';
import StatCard from '@/components/common/StatCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { formatCurrency, formatDateTime } from '@/utils/format';

const dashboard = useDashboardStore();
const summary = computed(() => dashboard.summary);

function statusLabel(code: string): string {
  return findCommonCode('PLANT_STATUS', code).name;
}
</script>

<template>
  <div>
    <div class="page-header-row">
      <div>
        <h1>Dashboard</h1>
        <p class="page-header-subtitle">전체 컬렉션 현황을 한눈에 확인하세요. (Mock Data)</p>
      </div>
    </div>

    <div class="stat-grid">
      <StatCard icon="🪴" label="총 식물수" :value="summary.totalPlants" />
      <StatCard icon="🌱" label="품종수" :value="summary.totalSpecies" />
      <StatCard icon="🏷️" label="판매중" :value="summary.statusCounts.FOR_SALE ?? 0" />
      <StatCard icon="⏳" label="예약중" :value="summary.statusCounts.RESERVED ?? 0" />
      <StatCard icon="✅" label="판매완료" :value="summary.statusCounts.SOLD ?? 0" />
      <StatCard icon="📍" label="위치 수" :value="summary.totalLocations" />
      <StatCard icon="🆕" label="오늘 등록" :value="summary.todayRegisteredCount" />
    </div>

    <div class="dashboard-grid">
      <section class="panel">
        <h2 class="panel-title">전체 상태 분포</h2>
        <ul class="status-dist-list">
          <li v-for="(count, code) in summary.statusCounts" :key="code">
            <StatusBadge :code="String(code)" :label="statusLabel(String(code))" />
            <span class="status-dist-count">{{ count }}개</span>
          </li>
        </ul>
      </section>

      <section class="panel">
        <h2 class="panel-title">최근 분갈이</h2>
        <ul v-if="summary.recentRepots.length > 0" class="recent-list">
          <li v-for="item in summary.recentRepots" :key="item.plantId + item.performedAt">
            <RouterLink :to="`/admin/plants/${item.plantId}`" class="recent-list-link">
              <span class="recent-list-name">{{ item.plantName }}</span>
              <span class="recent-list-code">{{ item.qrCode }}</span>
            </RouterLink>
            <span class="recent-list-date">{{ formatDateTime(item.performedAt) }}</span>
          </li>
        </ul>
        <EmptyState v-else message="최근 분갈이 이력이 없습니다." icon="🪴" />
      </section>

      <section class="panel">
        <h2 class="panel-title">최근 판매</h2>
        <ul v-if="summary.recentSales.length > 0" class="recent-list">
          <li v-for="item in summary.recentSales" :key="item.plantId + item.performedAt">
            <RouterLink :to="`/admin/plants/${item.plantId}`" class="recent-list-link">
              <span class="recent-list-name">{{ item.plantName }}</span>
              <span class="recent-list-code">{{ item.qrCode }}</span>
            </RouterLink>
            <span class="recent-list-date">{{ formatCurrency(item.amount) }} · {{ formatDateTime(item.performedAt) }}</span>
          </li>
        </ul>
        <EmptyState v-else message="최근 판매 이력이 없습니다." icon="💰" />
      </section>

      <section class="panel">
        <h2 class="panel-title">최근 사진등록</h2>
        <div v-if="summary.recentImages.length > 0" class="recent-image-grid">
          <RouterLink
            v-for="item in summary.recentImages"
            :key="item.plantId + item.createdAt"
            :to="`/admin/plants/${item.plantId}`"
            class="recent-image-item"
          >
            <img :src="item.imageUrl" alt="" />
            <span class="recent-image-code">{{ item.qrCode }}</span>
          </RouterLink>
        </div>
        <EmptyState v-else message="최근 등록된 사진이 없습니다." icon="🖼️" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.panel-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.9rem;
}

.status-dist-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.status-dist-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-dist-count {
  font-weight: 700;
  color: var(--color-text);
}

.recent-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.recent-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  font-size: 0.85rem;
}

.recent-list-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}

.recent-list-name {
  font-weight: 600;
  color: var(--color-text);
}

.recent-list-code {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.recent-list-date {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.recent-image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 0.6rem;
}

.recent-image-item {
  position: relative;
  display: block;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
}

.recent-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-image-code {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 0.62rem;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.1rem 0.3rem;
  text-align: center;
}
</style>
