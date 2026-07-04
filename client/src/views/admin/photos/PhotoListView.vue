<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { mockImages, mockPlantDetails } from '@/mock';
import type { ImageType } from '@/types/image';
import { IMAGE_TYPE_LABEL } from '@/types/image';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { formatDate } from '@/utils/format';

const typeFilter = ref<ImageType | ''>('');

const filtered = computed(() => {
  const list = typeFilter.value ? mockImages.filter((img) => img.imageType === typeFilter.value) : mockImages;
  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

function plantOf(plantId: string) {
  return mockPlantDetails.find((p) => p.id === plantId);
}
</script>

<template>
  <div>
    <PageHeader title="사진관리" subtitle="개체별 대표/꽃/판매/기타 사진을 관리합니다.">
      <template #actions>
        <button type="button" class="btn btn-primary" disabled title="Mock 화면에서는 비활성화됩니다">+ 사진 업로드</button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <select v-model="typeFilter">
        <option value="">전체 유형</option>
        <option value="PRIMARY">대표사진</option>
        <option value="FLOWER">꽃사진</option>
        <option value="SALE">판매사진</option>
        <option value="OTHER">기타</option>
      </select>
      <span class="filter-total">총 {{ filtered.length }}건</span>
    </div>

    <div v-if="filtered.length === 0" class="panel">
      <EmptyState message="등록된 사진이 없습니다." icon="🖼️" />
    </div>
    <div v-else class="photo-grid">
      <RouterLink v-for="img in filtered" :key="img.id" :to="`/admin/plants/${img.plantId}`" class="photo-card">
        <img :src="img.url" alt="" class="photo-thumb" />
        <div class="photo-card-body">
          <span class="badge badge-green">{{ IMAGE_TYPE_LABEL[img.imageType] }}</span>
          <div class="photo-plant-name">{{ plantOf(img.plantId)?.species.displayName ?? '-' }}</div>
          <div class="photo-meta">{{ plantOf(img.plantId)?.qrCode }} · {{ formatDate(img.createdAt) }}</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.filter-total {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
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
</style>
