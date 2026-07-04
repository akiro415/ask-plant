<script setup lang="ts">
import { computed, ref } from 'vue';
import { mockPlantSummaries } from '@/mock';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { placeholderQr } from '@/utils/placeholder';

const query = ref('');
const selectedId = ref<string | null>(mockPlantSummaries[0]?.id ?? null);

const filtered = computed(() =>
  mockPlantSummaries.filter((p) =>
    query.value ? `${p.qrCode} ${p.species.displayName} ${p.nickname ?? ''}`.toLowerCase().includes(query.value.toLowerCase()) : true,
  ),
);

const selected = computed(() => mockPlantSummaries.find((p) => p.id === selectedId.value) ?? null);
const selectedQrImage = computed(() => (selected.value ? placeholderQr(selected.value.qrCode, 240) : ''));
</script>

<template>
  <div>
    <PageHeader title="QR관리" subtitle="개체별 QR코드를 조회하고 라벨을 미리봅니다.">
      <template #actions>
        <button type="button" class="btn btn-primary" disabled title="Mock 화면에서는 비활성화됩니다">라벨 일괄 인쇄</button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <input v-model="query" type="text" placeholder="QR코드, 품종명, 닉네임 검색" />
      <span class="filter-total">총 {{ filtered.length }}건</span>
    </div>

    <div class="qr-grid">
      <div class="panel qr-list-panel">
        <div v-if="filtered.length === 0" class="table-empty">
          <EmptyState message="검색 결과가 없습니다." icon="🔗" />
        </div>
        <div v-else class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>QR코드</th>
                <th>품종</th>
                <th>상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filtered" :key="p.id" class="clickable" :class="{ selected: p.id === selectedId }" @click="selectedId = p.id">
                <td><code>{{ p.qrCode }}</code></td>
                <td>{{ p.species.displayName }}</td>
                <td><StatusBadge :code="p.status.code" :label="p.status.name" /></td>
                <td><button type="button" class="btn btn-outline btn-sm" @click.stop="selectedId = p.id">라벨 보기</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel qr-preview-panel">
        <h2 class="info-card-title">라벨 미리보기</h2>
        <div v-if="selected" class="qr-label-card">
          <img :src="selectedQrImage" alt="QR" class="qr-label-image" />
          <div class="qr-label-code">{{ selected.qrCode }}</div>
          <div class="qr-label-name">{{ selected.species.displayName }}</div>
          <div class="qr-label-sub">{{ selected.species.scientificName ?? selected.species.koreanName ?? '' }}</div>
          <button type="button" class="btn btn-primary btn-sm" disabled title="Mock 화면에서는 비활성화됩니다">인쇄하기</button>
        </div>
        <EmptyState v-else message="개체를 선택해주세요." icon="🔗" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-total {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.qr-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 860px) {
  .qr-grid {
    grid-template-columns: 1fr;
  }
}

tr.selected {
  background: var(--color-primary-lighter);
}

.qr-preview-panel {
  position: sticky;
  top: 1rem;
}

.info-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.9rem;
}

.qr-label-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.4rem;
  padding: 1rem;
  border: 1px dashed var(--color-border);
  border-radius: 10px;
}

.qr-label-image {
  width: 160px;
  height: 160px;
}

.qr-label-code {
  font-family: monospace;
  font-weight: 700;
  font-size: 1.05rem;
}

.qr-label-name {
  font-weight: 600;
  font-size: 0.88rem;
}

.qr-label-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: 0.5rem;
}

.table-empty {
  padding: 1rem 0;
}
</style>
