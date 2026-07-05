<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { usePhotoStore } from '@/stores/photo';
import type { ImageType } from '@/types/image';
import { IMAGE_TYPE_LABEL } from '@/types/image';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import PhotoFormModal from './PhotoFormModal.vue';
import { formatDate } from '@/utils/format';

const store = usePhotoStore();
const showForm = ref(false);

onMounted(() => {
  store.fetchPhotoList();
});

function closeForm() {
  showForm.value = false;
}

async function handleDelete(id: string) {
  if (!confirm('이 사진을 삭제하시겠습니까?')) return;
  await store.deletePhoto(id);
}
</script>

<template>
  <div>
    <PageHeader title="사진관리" subtitle="개체별 대표/꽃/판매/기타 사진을 관리합니다.">
      <template #actions>
        <button type="button" class="btn btn-primary" @click="showForm = true">+ 사진 업로드</button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <select :value="store.typeFilter" @change="store.setTypeFilter(($event.target as HTMLSelectElement).value as ImageType | '')">
        <option value="">전체 유형</option>
        <option value="PRIMARY">대표사진</option>
        <option value="FLOWER">꽃사진</option>
        <option value="SALE">판매사진</option>
        <option value="OTHER">기타</option>
      </select>
      <span class="filter-total">총 {{ store.filtered.length }}건</span>
    </div>

    <p v-if="store.deleteError" class="form-error">{{ store.deleteError }}</p>

    <div v-if="store.listLoading" class="panel">
      <EmptyState message="사진 목록을 불러오는 중입니다..." icon="⏳" />
    </div>
    <div v-else-if="store.listError" class="panel">
      <EmptyState :message="store.listError" icon="⚠️" />
      <div class="table-empty-actions"><button type="button" class="btn btn-outline btn-sm" @click="store.fetchPhotoList">다시 시도</button></div>
    </div>
    <div v-else-if="store.filtered.length === 0" class="panel">
      <EmptyState message="등록된 사진이 없습니다." icon="🖼️" />
    </div>
    <div v-else class="photo-grid">
      <div v-for="img in store.filtered" :key="img.id" class="photo-card-wrap">
        <RouterLink :to="`/admin/plants/${img.plantId}`" class="photo-card">
          <img :src="img.url" alt="" class="photo-thumb" />
          <div class="photo-card-body">
            <span class="badge badge-green">{{ IMAGE_TYPE_LABEL[img.imageType] }}</span>
            <div class="photo-plant-name">{{ store.plantDisplayName(img) }}</div>
            <div class="photo-meta">{{ img.plant.qrCode }} · {{ formatDate(img.createdAt) }}</div>
          </div>
        </RouterLink>
        <button
          type="button"
          class="photo-delete-btn btn btn-outline btn-sm btn-danger-outline"
          :disabled="store.deleteLoadingId === img.id"
          @click="handleDelete(img.id)"
        >
          {{ store.deleteLoadingId === img.id ? '...' : '삭제' }}
        </button>
      </div>
    </div>

    <PhotoFormModal v-if="showForm" @close="closeForm" @saved="closeForm" />
  </div>
</template>

<style scoped>
.filter-total {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.form-error {
  margin-bottom: 1rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.85rem;
}

.table-empty-actions {
  display: flex;
  justify-content: center;
  margin-top: -0.5rem;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.photo-card-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.photo-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s, box-shadow 0.15s;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  text-decoration: none;
}

.photo-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.photo-card-body {
  padding: 0.7rem 0.8rem;
}

.photo-plant-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 0.35rem;
}

.photo-meta {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.photo-delete-btn {
  align-self: flex-end;
}

.btn-danger-outline {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
</style>
