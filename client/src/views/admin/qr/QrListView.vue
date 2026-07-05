<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQrStore } from '@/stores/qr';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import { placeholderQr } from '@/utils/placeholder';

const store = useQrStore();

const selectedQrImage = computed(() => {
  const code = store.preview?.qrCode ?? store.selected?.qrCode;
  return code ? placeholderQr(code, 240) : '';
});

onMounted(() => {
  store.fetchQrList();
});
</script>

<template>
  <div>
    <PageHeader title="QR관리" subtitle="개체별 QR코드를 조회하고 라벨을 미리봅니다.">
      <template #actions>
        <BaseButton variant="outline" to="/admin/plants/new">+ 개체 등록 (QR 자동발급)</BaseButton>
        <BaseButton variant="primary" disabled title="라벨 일괄 인쇄 API는 아직 구현되지 않았습니다">라벨 일괄 인쇄</BaseButton>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <input
        type="text"
        placeholder="QR코드, 품종명, 닉네임 검색"
        :value="store.searchQuery"
        @input="store.setSearch(($event.target as HTMLInputElement).value)"
      />
      <span class="filter-total">총 {{ store.filtered.length }}건</span>
    </div>

    <div v-if="store.listLoading" class="panel">
      <EmptyState message="QR 목록을 불러오는 중입니다..." icon="⏳" />
    </div>
    <div v-else-if="store.listError" class="panel">
      <EmptyState :message="store.listError" icon="⚠️" />
      <div class="table-empty-actions"><BaseButton variant="outline" size="sm" @click="store.fetchQrList">다시 시도</BaseButton></div>
    </div>
    <div v-else class="qr-grid">
      <div class="panel qr-list-panel">
        <div v-if="store.filtered.length === 0" class="table-empty">
          <EmptyState message="등록된 개체가 없습니다." icon="🔗" />
        </div>
        <BaseTable v-else>
          <thead>
            <tr>
              <th>QR코드</th>
              <th>품종</th>
              <th>상태</th>
              <th colspan="2" class="col-actions">액션</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in store.filtered"
              :key="item.plantId"
              class="clickable"
              :class="{ selected: item.plantId === store.selectedId }"
              @click="store.selectPlant(item.plantId)"
            >
              <td><code>{{ item.qrCode }}</code></td>
              <td>{{ item.speciesDisplayName }}</td>
              <td><StatusBadge :code="item.status.code" :label="item.status.name" /></td>
              <td class="col-actions" @click.stop>
                <BaseButton variant="outline" size="sm" @click="store.selectPlant(item.plantId)">라벨</BaseButton>
              </td>
              <td class="col-actions" @click.stop>
                <BaseButton variant="outline" size="sm" :to="`/admin/qr/${item.plantId}`">상세</BaseButton>
              </td>
            </tr>
          </tbody>
        </BaseTable>
      </div>

      <div class="panel qr-preview-panel">
        <h2 class="info-card-title">라벨 미리보기</h2>
        <div v-if="store.previewLoading" class="qr-preview-loading">
          <EmptyState message="미리보기를 불러오는 중..." icon="⏳" />
        </div>
        <div v-else-if="store.previewError" class="qr-preview-loading">
          <EmptyState :message="store.previewError" icon="⚠️" />
        </div>
        <div v-else-if="store.preview" class="qr-label-card">
          <img :src="selectedQrImage" alt="QR" class="qr-label-image" />
          <div class="qr-label-code">{{ store.preview.qrCode }}</div>
          <div class="qr-label-meta">{{ store.preview.categoryCode }} · {{ store.preview.sequenceNumber }}</div>
          <div class="qr-label-name">{{ store.preview.speciesDisplayName }}</div>
          <div v-if="store.preview.nickname" class="qr-label-sub">{{ store.preview.nickname }}</div>
          <StatusBadge :code="store.preview.status.code" :label="store.preview.status.name" />
          <BaseButton variant="outline" size="sm" :to="`/admin/plants/${store.preview.plantId}`">개체 상세</BaseButton>
          <BaseButton variant="outline" size="sm" :to="store.preview.publicPath" target="_blank">공개 페이지</BaseButton>
          <BaseButton variant="primary" size="sm" disabled title="라벨 인쇄 API는 아직 구현되지 않았습니다">인쇄하기</BaseButton>
          <div v-if="store.publicLoading" class="qr-public-status">공개 조회 확인 중...</div>
          <div v-else-if="store.publicPreview" class="qr-public-status qr-public-ok">공개 API 조회 성공 (판매가 {{ store.publicPreview.sellingPrice ?? '미정' }})</div>
          <div v-else-if="store.publicError" class="qr-public-status qr-public-error">{{ store.publicError }}</div>
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

.table-empty-actions {
  display: flex;
  justify-content: center;
  margin-top: -0.5rem;
}

.qr-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: var(--space-5);
  align-items: start;
}

@media (max-width: 860px) {
  .qr-grid {
    grid-template-columns: 1fr;
  }
}

:deep(tr.selected) {
  background: var(--color-primary-soft);
}

.qr-preview-panel {
  position: sticky;
  top: var(--space-4);
}

.info-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.qr-preview-loading {
  padding: var(--space-2) 0;
}

.qr-label-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
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

.qr-label-meta {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.qr-label-name {
  font-weight: 600;
  font-size: 0.88rem;
}

.qr-label-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-1);
}

.qr-public-status {
  margin-top: var(--space-2);
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.qr-public-ok {
  color: var(--color-success);
}

.qr-public-error {
  color: var(--color-danger);
}

.table-empty {
  padding: var(--space-4) 0;
}
</style>
