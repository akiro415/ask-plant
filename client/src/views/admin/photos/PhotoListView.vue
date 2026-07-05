<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { usePhotoStore } from '@/stores/photo';
import type { ImageApiRow } from '@/api/image.api';
import type { ImageType } from '@/types/image';
import { IMAGE_TYPE_LABEL } from '@/types/image';
import PageHeader from '@/components/common/PageHeader.vue';
import FilterBar from '@/components/common/FilterBar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import TableRowActions from '@/components/common/TableRowActions.vue';
import PhotoFormModal from './PhotoFormModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseAutocomplete from '@/components/base/BaseAutocomplete.vue';
import { formatDate } from '@/utils/format';

const typeFilterOptions = computed(() =>
  (Object.entries(IMAGE_TYPE_LABEL) as [ImageType, string][]).map(([value, label]) => ({ value, label })),
);

const store = usePhotoStore();
const showForm = ref(false);
const editingImage = ref<ImageApiRow | null>(null);

onMounted(() => {
  store.fetchPhotoList();
});

function openCreate() {
  editingImage.value = null;
  showForm.value = true;
}

function openEdit(img: ImageApiRow, event: Event) {
  event.stopPropagation();
  editingImage.value = img;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingImage.value = null;
}

async function handleDelete(id: string, event: Event) {
  event.stopPropagation();
  if (!confirm('이 사진을 삭제하시겠습니까?')) return;
  await store.deletePhoto(id);
}
</script>

<template>
  <div>
    <PageHeader title="사진관리" subtitle="개체별 대표/꽃/판매/기타 사진을 관리합니다.">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate">사진 등록</BaseButton>
      </template>
    </PageHeader>

    <FilterBar :show-search-button="false">
      <template #filters>
        <BaseAutocomplete
          :model-value="store.typeFilter"
          variant="filter"
          :options="typeFilterOptions"
          nullable
          empty-label="전체 유형"
          placeholder="유형"
          min-width="130px"
          @update:model-value="(v) => store.setTypeFilter(v as ImageType | '')"
        />
      </template>
      <template #search>
        <span class="filter-spacer" />
      </template>
      <template #meta>
        <span>총 {{ store.filtered.length }}건</span>
      </template>
    </FilterBar>

    <p v-if="store.deleteError" class="form-error form-error--block">{{ store.deleteError }}</p>

    <div v-if="store.listLoading" class="panel">
      <EmptyState message="사진 목록을 불러오는 중입니다..." icon="⏳" />
    </div>
    <div v-else-if="store.listError" class="panel">
      <EmptyState :message="store.listError" icon="⚠️" />
      <div class="table-empty-actions"><BaseButton variant="outline" size="sm" @click="store.fetchPhotoList">다시 시도</BaseButton></div>
    </div>
    <div v-else-if="store.filtered.length === 0" class="panel">
      <EmptyState message="등록된 사진이 없습니다." icon="🖼️" />
    </div>
    <div v-else class="photo-grid">
      <div v-for="img in store.filtered" :key="img.id" class="photo-card-wrap">
        <RouterLink :to="`/admin/plants/${img.plantId}`" class="photo-card">
          <img :src="img.url" alt="" class="photo-thumb" />
          <div class="photo-card-actions" @click.prevent.stop>
            <TableRowActions
              :delete-loading="store.deleteLoadingId === img.id"
              @edit="openEdit(img, $event)"
              @delete="handleDelete(img.id, $event)"
            />
          </div>
          <div class="photo-card-body">
            <span class="badge badge-green">{{ IMAGE_TYPE_LABEL[img.imageType] }}</span>
            <div class="photo-plant-name">{{ store.plantDisplayName(img) }}</div>
            <div class="photo-meta">{{ img.plant.qrCode }} · {{ formatDate(img.createdAt) }}</div>
          </div>
        </RouterLink>
      </div>
    </div>

    <PhotoFormModal v-if="showForm" :image="editingImage" @close="closeForm" @saved="closeForm" />
  </div>
</template>

<style scoped>
.filter-spacer {
  flex: 1;
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
}

.photo-card {
  position: relative;
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

.photo-card-actions {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  z-index: 1;
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  border-radius: var(--radius-sm);
  padding: 2px;
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
