import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { PublicPlant, PublicCartPlant } from '@/types/public';
import type { PlantImage, ImageType } from '@/types/image';
import { fetchPublicPlantByQrCode } from '@/api/public.api';
import { extractErrorMessage } from '@/api/http';
import axios from 'axios';

function toGalleryImages(plant: PublicPlant): PlantImage[] {
  return plant.images
    .filter((img) => img.imageType !== 'OTHER')
    .map((img, index) => ({
      id: `${plant.qrCode}-${index}`,
      plantId: plant.qrCode,
      url: img.url,
      imageType: img.imageType as ImageType,
      caption: null,
      isPrimary: index === 0,
      sortOrder: index,
      createdAt: '',
    }));
}

export function toPublicCartPlant(plant: PublicPlant): PublicCartPlant {
  const primary = plant.images.find((img) => img.imageType === 'PRIMARY') ?? plant.images[0];
  return {
    qrCode: plant.qrCode,
    nickname: plant.nickname,
    displayName: plant.species.displayName,
    sellingPrice: plant.sellingPrice,
    primaryImageUrl: primary?.url ?? '',
    statusCode: plant.status.code,
  };
}

export const usePublicPlantStore = defineStore('publicPlant', () => {
  const plant = ref<PublicPlant | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const notFound = ref(false);

  const galleryImages = computed(() => (plant.value ? toGalleryImages(plant.value) : []));
  const displayTitle = computed(() => plant.value?.nickname ?? plant.value?.species.displayName ?? '');
  const displaySubtitle = computed(() => {
    if (!plant.value) return '';
    const s = plant.value.species;
    return s.scientificName ?? s.koreanName ?? s.englishName ?? s.displayName;
  });
  const canOrder = computed(() => plant.value?.status.code === 'FOR_SALE');

  /** GET /api/v1/public/plants/:qrCode */
  async function fetchByQrCode(qrCode: string) {
    loading.value = true;
    error.value = null;
    notFound.value = false;
    plant.value = null;
    try {
      plant.value = await fetchPublicPlantByQrCode(qrCode);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        notFound.value = true;
      } else {
        error.value = extractErrorMessage(err, '식물 정보를 불러오지 못했습니다');
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    plant,
    loading,
    error,
    notFound,
    galleryImages,
    displayTitle,
    displaySubtitle,
    canOrder,
    fetchByQrCode,
  };
});
