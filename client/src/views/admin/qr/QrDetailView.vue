<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useQrStore } from '@/stores/qr';
import { useAuthStore } from '@/stores/auth';
import StatusBadge from '@/components/common/StatusBadge.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import DetailEditToolbar from '@/components/common/DetailEditToolbar.vue';
import PlantFormModal from '@/views/admin/plants/PlantFormModal.vue';
import { usePlantStore } from '@/stores/plant';
import { placeholderQr } from '@/utils/placeholder';

const route = useRoute();
const router = useRouter();
const qrStore = useQrStore();
const plantStore = usePlantStore();
const auth = useAuthStore();

const showPlantForm = ref(false);
const plantId = computed(() => String(route.params.plantId));

const canManage = computed(() => auth.hasRole('ADMIN', 'STAFF'));
const qrImage = computed(() => (qrStore.preview ? placeholderQr(qrStore.preview.qrCode, 240) : ''));

async function load() {
  await qrStore.fetchPreview(plantId.value);
  if (qrStore.preview) {
    await plantStore.fetchPlantById(plantId.value);
  }
}

onMounted(async () => {
  await qrStore.fetchQrList();
  await load();
});
watch(() => route.params.plantId, load);
</script>

<template>
  <div v-if="qrStore.previewLoading" class="panel"><EmptyState message="QR 정보를 불러오는 중..." icon="⏳" /></div>
  <div v-else-if="qrStore.previewError" class="panel">
    <EmptyState :message="qrStore.previewError" icon="⚠️" />
    <div class="actions-center"><button type="button" class="btn btn-outline btn-sm" @click="load">다시 시도</button></div>
  </div>
  <div v-else-if="qrStore.preview">
    <div class="page-header-row">
      <div>
        <h1>QR 상세</h1>
        <p class="page-header-subtitle"><code>{{ qrStore.preview.qrCode }}</code> · {{ qrStore.preview.speciesDisplayName }}</p>
      </div>
      <div class="detail-actions">
        <DetailEditToolbar v-if="canManage && plantStore.currentPlant" :edit-mode="false" @edit="showPlantForm = true" />
        <button type="button" class="btn btn-outline btn-sm" @click="router.push('/admin/qr')">← QR 목록</button>
      </div>
    </div>

    <div class="qr-detail-grid">
      <section class="panel qr-label-card">
        <img :src="qrImage" alt="QR" class="qr-image" />
        <div class="qr-code">{{ qrStore.preview.qrCode }}</div>
        <div class="qr-meta">{{ qrStore.preview.categoryCode }} · {{ qrStore.preview.sequenceNumber }}</div>
        <StatusBadge :code="qrStore.preview.status.code" :label="qrStore.preview.status.name" />
      </section>

      <section class="panel info-card">
        <div class="info-row"><span class="info-label">품종</span><span class="info-value">{{ qrStore.preview.speciesDisplayName }}</span></div>
        <div class="info-row"><span class="info-label">닉네임</span><span class="info-value">{{ qrStore.preview.nickname ?? '-' }}</span></div>
        <div class="info-row"><span class="info-label">공개 경로</span><span class="info-value">{{ qrStore.preview.publicPath }}</span></div>
        <div class="info-row actions-row">
          <RouterLink :to="`/admin/plants/${plantId}`" class="btn btn-outline btn-sm">개체 상세</RouterLink>
          <RouterLink :to="qrStore.preview.publicPath" class="btn btn-outline btn-sm" target="_blank">공개 페이지</RouterLink>
        </div>
        <p v-if="canManage" class="hint">닉네임·상태 등 개체 정보 수정은 「수정」 버튼으로 Plant 폼을 엽니다.</p>
      </section>
    </div>

    <PlantFormModal
      v-if="showPlantForm && plantStore.currentPlant"
      :plant="plantStore.currentPlant"
      @close="showPlantForm = false"
      @saved="showPlantForm = false; load()"
    />
  </div>
  <EmptyState v-else message="QR 정보를 찾을 수 없습니다." icon="🔗" />
</template>

<style scoped>
.detail-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qr-detail-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
}

@media (max-width: 760px) {
  .qr-detail-grid {
    grid-template-columns: 1fr;
  }
}

.qr-label-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.45rem;
}

.qr-image {
  width: 180px;
  height: 180px;
}

.qr-code {
  font-family: monospace;
  font-weight: 700;
  font-size: 1.05rem;
}

.qr-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 0;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.info-label {
  color: var(--color-text-muted);
}

.info-value {
  font-weight: 600;
}

.actions-row {
  justify-content: flex-start;
  gap: 0.5rem;
  border-bottom: none;
  padding-top: 0.75rem;
}

.hint {
  margin-top: 0.75rem;
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.actions-center {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}
</style>
