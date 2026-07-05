<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSpeciesStore } from '@/stores/species';
import { usePlantStore } from '@/stores/plant';
import { useUiStore } from '@/stores/ui';
import { TAXON_RANK_LABEL } from '@/types/species';
import StatusBadge from '@/components/common/StatusBadge.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const route = useRoute();
const speciesStore = useSpeciesStore();
const plantStore = usePlantStore();
const ui = useUiStore();

const species = computed(() => speciesStore.findById(String(route.params.id)));
const plants = computed(() => plantStore.plants.filter((p) => p.species.id === species.value?.id));

function sync() {
  ui.setBreadcrumbExtra(species.value?.displayName ?? null);
}
onMounted(() => {
  sync();
  // Plant 목록은 이제 API로 조회되므로, 목록 화면을 거치지 않고 바로 진입해도 보유 개체가 보이도록 최초 1회 로드를 보장한다.
  plantStore.ensurePlantsLoaded();
});
watch(() => route.params.id, sync);
</script>

<template>
  <div v-if="species">
    <div class="page-header-row">
      <div>
        <h1>{{ species.displayName }}</h1>
        <p class="page-header-subtitle">{{ species.scientificName ?? '학명 미상' }} · {{ TAXON_RANK_LABEL[species.taxonRank] }}</p>
      </div>
    </div>

    <div class="species-detail-grid">
      <div class="panel">
        <img :src="species.thumbnailUrl" alt="" class="species-detail-thumb" />
      </div>
      <div class="panel info-card">
        <div class="info-row"><span class="info-label">카테고리</span><span class="info-value">{{ species.category?.name ?? '-' }} ({{ species.category?.code }})</span></div>
        <div class="info-row"><span class="info-label">영문명</span><span class="info-value">{{ species.englishName ?? '-' }}</span></div>
        <div class="info-row"><span class="info-label">국문명</span><span class="info-value">{{ species.koreanName ?? '-' }}</span></div>
        <div class="info-row"><span class="info-label">필드넘버</span><span class="info-value">{{ species.fieldNumber ?? '-' }}</span></div>
        <div class="info-row"><span class="info-label">판매자명</span><span class="info-value">{{ species.sellerName ?? '-' }}</span></div>
        <div class="info-row"><span class="info-label">교배종 여부</span><span class="info-value">{{ species.isHybrid ? '예' : '아니오' }}</span></div>
        <div class="info-row"><span class="info-label">속 / 과</span><span class="info-value">{{ species.genus ?? '-' }} / {{ species.family ?? '-' }}</span></div>
        <div class="info-row"><span class="info-label">기본 물주기</span><span class="info-value">{{ species.defaultWateringCycleDays ?? '-' }}일</span></div>
        <div class="info-row"><span class="info-label">관리 가이드</span><span class="info-value">{{ species.careGuide ?? '-' }}</span></div>
      </div>
    </div>

    <section class="panel">
      <h2 class="info-card-title">보유 개체 ({{ plants.length }}개)</h2>
      <div v-if="plants.length === 0" class="table-empty">
        <EmptyState message="등록된 개체가 없습니다." icon="🪴" />
      </div>
      <div v-else class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>QR코드</th>
              <th>닉네임</th>
              <th>위치</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in plants" :key="p.id" class="clickable" @click="$router.push(`/admin/plants/${p.id}`)">
              <td><code>{{ p.qrCode }}</code></td>
              <td>{{ p.nickname ?? '-' }}</td>
              <td>{{ p.location?.name ?? '-' }}</td>
              <td><StatusBadge :code="p.status.code" :label="p.status.name" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
  <EmptyState v-else message="해당 품종을 찾을 수 없습니다." icon="🔍" />
</template>

<style scoped>
.species-detail-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
  align-items: start;
}

@media (max-width: 760px) {
  .species-detail-grid {
    grid-template-columns: 1fr;
  }
}

.species-detail-thumb {
  width: 100%;
  border-radius: 8px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
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

.table-empty {
  padding: 1rem 0;
}
</style>
