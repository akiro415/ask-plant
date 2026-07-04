<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { usePlantStore } from '@/stores/plant';
import { useUiStore } from '@/stores/ui';
import ImageGallery from '@/components/common/ImageGallery.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import Timeline from '@/components/common/Timeline.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { placeholderQr } from '@/utils/placeholder';
import { formatCurrency, formatDate } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const store = usePlantStore();
const ui = useUiStore();

const plant = computed(() => store.getDetail(String(route.params.id)));
const children = computed(() => (plant.value ? store.getChildren(plant.value.id) : []));
const qrImage = computed(() => (plant.value ? placeholderQr(plant.value.qrCode) : ''));

function syncBreadcrumb() {
  ui.setBreadcrumbExtra(plant.value ? plant.value.qrCode : null);
}

onMounted(syncBreadcrumb);
watch(() => route.params.id, syncBreadcrumb);
</script>

<template>
  <div v-if="plant">
    <div class="page-header-row">
      <div>
        <h1>{{ plant.species.displayName }}</h1>
        <p class="page-header-subtitle">{{ plant.nickname ?? '별칭 없음' }} · <code>{{ plant.qrCode }}</code></p>
      </div>
      <div class="detail-actions">
        <StatusBadge :code="plant.status.code" :label="plant.status.name" />
        <button type="button" class="btn btn-outline btn-sm" @click="router.back()">← 목록으로</button>
      </div>
    </div>

    <div class="plant-detail-grid">
      <div class="plant-detail-left">
        <div class="panel">
          <ImageGallery :images="plant.images" />
        </div>
      </div>

      <div class="plant-detail-right">
        <section class="panel info-card">
          <h2 class="info-card-title">식물 정보</h2>
          <div class="info-row"><span class="info-label">유통명</span><span class="info-value">{{ plant.species.displayName }}</span></div>
          <div class="info-row"><span class="info-label">학명</span><span class="info-value">{{ plant.species.scientificName ?? '학명 미상' }}</span></div>
          <div class="info-row"><span class="info-label">국문명</span><span class="info-value">{{ plant.species.koreanName ?? '-' }}</span></div>
          <div class="info-row"><span class="info-label">카테고리</span><span class="info-value">{{ plant.species.category?.name ?? '-' }}</span></div>
          <div class="info-row"><span class="info-label">화분 크기</span><span class="info-value">{{ plant.potSize ?? '-' }}</span></div>
          <div class="info-row"><span class="info-label">메모</span><span class="info-value">{{ plant.memo ?? '-' }}</span></div>
        </section>

        <section class="panel info-card">
          <h2 class="info-card-title">가격</h2>
          <div class="info-row"><span class="info-label">구매가</span><span class="info-value">{{ formatCurrency(plant.purchasePrice) }}</span></div>
          <div class="info-row"><span class="info-label">판매가</span><span class="info-value price-highlight">{{ formatCurrency(plant.sellingPrice) }}</span></div>
          <div class="info-row"><span class="info-label">구매일</span><span class="info-value">{{ formatDate(plant.purchaseDate) }}</span></div>
          <div class="info-row"><span class="info-label">파종일</span><span class="info-value">{{ formatDate(plant.seedDate) }}</span></div>
        </section>

        <section class="panel info-card">
          <h2 class="info-card-title">위치</h2>
          <div class="info-row"><span class="info-label">현재 위치</span><span class="info-value">{{ plant.location?.name ?? '미지정' }}</span></div>
        </section>

        <section class="panel info-card qr-card">
          <h2 class="info-card-title">QR</h2>
          <div class="qr-card-body">
            <img :src="qrImage" alt="QR" class="qr-image" />
            <div>
              <div class="qr-code-text">{{ plant.qrCode }}</div>
              <RouterLink to="/admin/qr" class="btn btn-outline btn-sm">라벨 보기</RouterLink>
            </div>
          </div>
        </section>

        <section class="panel info-card">
          <h2 class="info-card-title">번식방법 · 부모개체</h2>
          <div class="info-row"><span class="info-label">기원(번식방법)</span><span class="info-value">{{ plant.originType.name }}</span></div>
          <div class="info-row">
            <span class="info-label">부모개체</span>
            <span class="info-value">
              <RouterLink v-if="plant.parentPlant" :to="`/admin/plants/${plant.parentPlant.id}`">
                {{ plant.parentPlant.qrCode }} ({{ plant.parentPlant.displayName }})
              </RouterLink>
              <span v-else>-</span>
            </span>
          </div>
          <div class="info-row"><span class="info-label">파생 개체 수</span><span class="info-value">{{ plant.childPlantCount }}개</span></div>
          <ul v-if="children.length > 0" class="child-list">
            <li v-for="child in children" :key="child.id">
              <RouterLink :to="`/admin/plants/${child.id}`">{{ child.qrCode }}</RouterLink>
              <StatusBadge :code="child.status.code" :label="child.status.name" />
            </li>
          </ul>
        </section>
      </div>
    </div>

    <section class="panel timeline-panel">
      <h2 class="info-card-title">Timeline (이력)</h2>
      <Timeline :histories="plant.histories" />
    </section>
  </div>

  <EmptyState v-else message="해당 개체를 찾을 수 없습니다." icon="🔍" />
</template>

<style scoped>
.detail-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.plant-detail-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  align-items: start;
  margin-bottom: 1.5rem;
}

@media (max-width: 960px) {
  .plant-detail-grid {
    grid-template-columns: 1fr;
  }
}

.plant-detail-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.7rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.info-value {
  text-align: right;
  color: var(--color-text);
  font-weight: 600;
}

.price-highlight {
  color: var(--color-primary);
  font-size: 1rem;
}

.qr-card-body {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.qr-image {
  width: 90px;
  height: 90px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.qr-code-text {
  font-family: monospace;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.child-list {
  list-style: none;
  margin-top: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.child-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
}

.timeline-panel {
  margin-top: 0.5rem;
}
</style>
