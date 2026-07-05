<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { usePlantStore } from '@/stores/plant';
import { useHistoryStore } from '@/stores/history';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import ImageGallery from '@/components/common/ImageGallery.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import Timeline from '@/components/common/Timeline.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import DetailPageActions from '@/components/common/DetailPageActions.vue';
import HistoryFormModal from './HistoryFormModal.vue';
import PlantFormModal from './PlantFormModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { placeholderQr } from '@/utils/placeholder';
import { formatCurrency, formatDate } from '@/utils/format';
import type { PlantHistory } from '@/types/history';

const route = useRoute();
const store = usePlantStore();
const historyStore = useHistoryStore();
const ui = useUiStore();
const auth = useAuthStore();

const showHistoryForm = ref(false);
const editingHistory = ref<PlantHistory | null>(null);
const showPlantForm = ref(false);

const canManage = computed(() => auth.hasRole('ADMIN', 'STAFF'));

const loading = computed(() => store.detailLoading);
const error = computed(() => store.detailError);
const plant = computed(() => store.currentPlant);
const children = computed(() => (plant.value ? store.getChildren(plant.value.id) : []));
const qrImage = computed(() => (plant.value ? placeholderQr(plant.value.qrCode) : ''));

function load() {
  ui.setBreadcrumbExtra(null);
  const plantId = String(route.params.id);
  store.fetchPlantById(plantId).then(() => {
    ui.setBreadcrumbExtra(plant.value ? plant.value.qrCode : null);
  });
  historyStore.fetchByPlantId(plantId);
}

async function handleDeleteHistory(id: string) {
  if (!plant.value) return;
  if (!confirm('이 이력을 삭제하시겠습니까?')) return;
  await historyStore.deleteHistory(id, plant.value.id);
}

function openHistoryCreate() {
  editingHistory.value = null;
  showHistoryForm.value = true;
}

function openHistoryEdit(history: PlantHistory) {
  editingHistory.value = history;
  showHistoryForm.value = true;
}

function closeHistoryForm() {
  showHistoryForm.value = false;
  editingHistory.value = null;
}

onMounted(load);
watch(() => route.params.id, load);
</script>

<template>
  <div v-if="loading" class="panel detail-status-panel">
    <EmptyState message="개체 정보를 불러오는 중입니다..." icon="⏳" />
  </div>

  <div v-else-if="error" class="panel detail-status-panel">
    <EmptyState :message="error" icon="⚠️" />
    <div class="detail-status-actions"><BaseButton variant="outline" size="sm" @click="load">다시 시도</BaseButton></div>
  </div>

  <div v-else-if="plant">
    <div class="page-header-row">
      <div>
        <h1>{{ plant.species.displayName }}</h1>
        <p class="page-header-subtitle">{{ plant.nickname ?? '별칭 없음' }} · <code>{{ plant.qrCode }}</code></p>
      </div>
      <div class="detail-actions">
        <StatusBadge :code="plant.status.code" :label="plant.status.name" />
        <DetailPageActions
          v-if="canManage"
          list-to="/admin/plants"
          :can-delete="false"
          @edit="showPlantForm = true"
        />
        <DetailPageActions v-else list-to="/admin/plants" :can-edit="false" :can-delete="false" />
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
          <h2 class="info-card-title">가격 · 두수 · 구입처</h2>
          <div class="info-row"><span class="info-label">꽃색</span><span class="info-value">{{ plant.flowerColor ?? '-' }}</span></div>
          <div class="info-row"><span class="info-label">구입두수</span><span class="info-value">{{ plant.purchaseHeadCount ?? '-' }}</span></div>
          <div class="info-row"><span class="info-label">구입 1두 가격</span><span class="info-value">{{ formatCurrency(plant.purchaseUnitPrice) }}</span></div>
          <div class="info-row"><span class="info-label">현재 두수</span><span class="info-value">{{ plant.currentHeadCount ?? '-' }}</span></div>
          <div class="info-row"><span class="info-label">두수별 판매가</span><span class="info-value">{{ formatCurrency(plant.unitSellingPrice) }}</span></div>
          <div class="info-row"><span class="info-label">총판매가</span><span class="info-value price-highlight">{{ formatCurrency(plant.totalSellingPrice ?? plant.sellingPrice) }}</span></div>
          <div class="info-row"><span class="info-label">구입업체</span><span class="info-value">{{ plant.purchaseVendor ?? '-' }}</span></div>
          <div class="info-row"><span class="info-label">구입농장</span><span class="info-value">{{ plant.purchaseFarm ?? '-' }}</span></div>
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
              <BaseButton variant="outline" size="sm" to="/admin/qr">라벨 보기</BaseButton>
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
      <div class="timeline-panel-header">
        <h2 class="info-card-title">Timeline (이력)</h2>
        <BaseButton variant="outline" size="sm" @click="openHistoryCreate">이력 등록</BaseButton>
      </div>
      <p v-if="historyStore.deleteError" class="form-error form-error--block">{{ historyStore.deleteError }}</p>
      <div v-if="historyStore.listLoading" class="timeline-loading">
        <EmptyState message="이력을 불러오는 중..." icon="⏳" />
      </div>
      <Timeline
        v-else
        :histories="historyStore.histories"
        show-actions
        :delete-loading-id="historyStore.deleteLoadingId"
        @delete="handleDeleteHistory"
        @edit="openHistoryEdit"
      />
    </section>

    <HistoryFormModal
      v-if="showHistoryForm && plant"
      :plant-id="plant.id"
      :history="editingHistory"
      @close="closeHistoryForm"
      @saved="closeHistoryForm"
    />
    <PlantFormModal v-if="showPlantForm && plant" :plant="plant" @close="showPlantForm = false" @saved="showPlantForm = false" />
  </div>

  <EmptyState v-else message="해당 개체를 찾을 수 없습니다." icon="🔍" />
</template>

<style scoped>
.detail-status-panel {
  margin-top: 0.5rem;
}

.detail-status-actions {
  display: flex;
  justify-content: center;
  margin-top: -1rem;
}

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

.timeline-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.timeline-panel-header .info-card-title {
  margin-bottom: 0;
}

.timeline-loading {
  padding: 0.5rem 0;
}
</style>
