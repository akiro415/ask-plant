import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ImageType } from '@/types/image';
import { fetchImages, createPlantImage as createPlantImageApi, deleteImage as deleteImageApi, type ImageApiRow, type CreateImagePayload } from '@/api/image.api';
import { extractErrorMessage } from '@/api/http';

export const usePhotoStore = defineStore('photo', () => {
  const rawRows = ref<ImageApiRow[]>([]);
  const listLoading = ref(false);
  const listError = ref<string | null>(null);
  const listLoaded = ref(false);

  const typeFilter = ref<ImageType | ''>('');

  const formLoading = ref(false);
  const formError = ref<string | null>(null);
  const deleteLoadingId = ref<string | null>(null);
  const deleteError = ref<string | null>(null);

  const filtered = computed(() => {
    const list = typeFilter.value ? rawRows.value.filter((img) => img.imageType === typeFilter.value) : rawRows.value;
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  function setTypeFilter(value: ImageType | '') {
    typeFilter.value = value;
  }

  function plantDisplayName(row: ImageApiRow): string {
    return row.plant.displayName;
  }

  /** GET /api/v1/images */
  async function fetchPhotoList() {
    listLoading.value = true;
    listError.value = null;
    try {
      rawRows.value = await fetchImages({ limit: 100 });
      listLoaded.value = true;
    } catch (error) {
      listError.value = extractErrorMessage(error, '사진 목록을 불러오지 못했습니다');
    } finally {
      listLoading.value = false;
    }
  }

  /** POST /api/v1/plants/:id/images */
  async function createPhoto(plantId: string, payload: CreateImagePayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await createPlantImageApi(plantId, payload);
      await fetchPhotoList();
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '사진 등록에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** DELETE /api/v1/images/:id */
  async function deletePhoto(id: string): Promise<boolean> {
    deleteLoadingId.value = id;
    deleteError.value = null;
    try {
      await deleteImageApi(id);
      await fetchPhotoList();
      return true;
    } catch (error) {
      deleteError.value = extractErrorMessage(error, '사진 삭제에 실패했습니다');
      return false;
    } finally {
      deleteLoadingId.value = null;
    }
  }

  return { rawRows, listLoading, listError, filtered, typeFilter, formLoading, formError, deleteLoadingId, deleteError, setTypeFilter, plantDisplayName, fetchPhotoList, createPhoto, deletePhoto };
});
