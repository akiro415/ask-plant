<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useDashboardStore } from '@/stores/dashboard';
import StatCard from '@/components/common/StatCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { formatCurrency, formatDateTime } from '@/utils/format';

const dashboard = useDashboardStore();
const summary = computed(() => dashboard.summary);
const recentPart = computed(() => dashboard.recentPart);

function statusCount(code: string): number {
  return summary.value?.statusDistribution.find((s) => s.code === code)?.count ?? 0;
}

onMounted(() => {
  dashboard.fetchStats();
});
</script>

<template>
  <div>
    <div class="page-header-row">
      <div>
        <h1>Dashboard</h1>
        <p class="page-header-subtitle">전체 컬렉션 현황을 한눈에 확인하세요.</p>
      </div>
    </div>

    <div v-if="dashboard.statsLoading" class="panel">
      <EmptyState message="대시보드 데이터를 불러오는 중입니다..." icon="⏳" />
    </div>
    <div v-else-if="dashboard.statsError" class="panel">
      <EmptyState :message="dashboard.statsError" icon="⚠️" />
      <div class="table-empty-actions"><button type="button" class="btn btn-outline btn-sm" @click="dashboard.fetchStats">다시 시도</button></div>
    </div>
    <template v-else-if="summary">
    <div class="stat-grid">
      <StatCard icon="🪴" label="총 식물수" :value="summary.plantCount" />
      <StatCard icon="🌱" label="품종수" :value="summary.speciesCount" />
      <StatCard icon="🏷️" label="판매중" :value="statusCount('FOR_SALE')" />
      <StatCard icon="⏳" label="예약중" :value="statusCount('RESERVED')" />
      <StatCard icon="✅" label="판매완료" :value="statusCount('SOLD')" />
      <StatCard icon="📍" label="위치 수" :value="summary.locationCount" />
    </div>

    <div class="dashboard-grid">
      <section class="panel">
        <h2 class="panel-title">전체 상태 분포</h2>
        <ul v-if="summary.statusDistribution.length > 0" class="status-dist-list">
          <li v-for="item in summary.statusDistribution" :key="item.code">
            <StatusBadge :code="item.code" :label="item.name" />
            <span class="status-dist-count">{{ item.count }}개</span>
          </li>
        </ul>
        <EmptyState v-else message="상태 분포 데이터가 없습니다." icon="🏷️" />
      </section>

      <section class="panel">
        <h2 class="panel-title">최근 등록 개체</h2>
        <ul v-if="summary.recentPlants.length > 0" class="recent-list">
          <li v-for="item in summary.recentPlants" :key="item.id">
            <RouterLink :to="`/admin/plants/${item.id}`" class="recent-list-link">
              <span class="recent-list-name">{{ item.nickname ?? item.species.displayName }}</span>
              <span class="recent-list-code">{{ item.qrCode }}</span>
            </RouterLink>
            <div class="recent-list-meta">
              <StatusBadge :code="item.status.code" :label="item.status.name" />
              <span class="recent-list-date">{{ formatDateTime(item.createdAt) }}</span>
            </div>
          </li>
        </ul>
        <EmptyState v-else message="등록된 개체가 없습니다." icon="🪴" />
      </section>

      <section class="panel">
        <h2 class="panel-title">최근 분갈이</h2>
        <ul v-if="recentPart.recentRepots.length > 0" class="recent-list">
          <li v-for="item in recentPart.recentRepots" :key="item.plantId + item.performedAt">
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
        <ul v-if="recentPart.recentSales.length > 0" class="recent-list">
          <li v-for="item in recentPart.recentSales" :key="item.plantId + item.performedAt">
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
        <div v-if="recentPart.recentImages.length > 0" class="recent-image-grid">
          <RouterLink
            v-for="item in recentPart.recentImages"
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
    </template>
  </div>
</template>

<style scoped>
.table-empty-actions {
  display: flex;
  justify-content: center;
  margin-top: -0.5rem;
}

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

.recent-list-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
