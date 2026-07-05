import { defineStore } from 'pinia';

import { computed, ref } from 'vue';

import type { QrListItem, QrPreview } from '@/types/qr';

import { fetchQrList as fetchQrListApi, fetchQrPreview } from '@/api/qr.api';

import { fetchPublicPlantByQrCode } from '@/api/public.api';

import type { PublicPlant } from '@/types/public';

import { extractErrorMessage } from '@/api/http';



export const useQrStore = defineStore('qr', () => {

  const items = ref<QrListItem[]>([]);

  const searchQuery = ref('');

  const selectedId = ref<string | null>(null);



  const preview = ref<QrPreview | null>(null);

  const previewLoading = ref(false);

  const previewError = ref<string | null>(null);



  const publicPreview = ref<PublicPlant | null>(null);

  const publicLoading = ref(false);

  const publicError = ref<string | null>(null);



  const listLoading = ref(false);

  const listError = ref<string | null>(null);



  const filtered = computed(() => {

    if (!searchQuery.value) return items.value;

    const q = searchQuery.value.toLowerCase();

    return items.value.filter((item) => {

      const haystack = `${item.qrCode} ${item.speciesDisplayName} ${item.nickname ?? ''}`.toLowerCase();

      return haystack.includes(q);

    });

  });



  const selected = computed(() => items.value.find((item) => item.plantId === selectedId.value) ?? null);



  function setSearch(value: string) {

    searchQuery.value = value;

  }



  async function selectPlant(plantId: string) {

    selectedId.value = plantId;

    await Promise.all([fetchPreview(plantId), fetchPublicPreviewByPlantId(plantId)]);

  }



  /** GET /qr/list */

  async function fetchQrList() {

    listLoading.value = true;

    listError.value = null;

    try {

      items.value = await fetchQrListApi({ limit: 200 });

      if (!selectedId.value && items.value.length > 0) {

        await selectPlant(items.value[0].plantId);

      } else if (selectedId.value) {

        const stillExists = items.value.some((item) => item.plantId === selectedId.value);

        if (!stillExists) {

          selectedId.value = items.value[0]?.plantId ?? null;

          preview.value = null;

          publicPreview.value = null;

          if (selectedId.value) await selectPlant(selectedId.value);

        } else {

          await selectPlant(selectedId.value);

        }

      }

    } catch (error) {

      listError.value = extractErrorMessage(error, 'QR 목록을 불러오지 못했습니다');

    } finally {

      listLoading.value = false;

    }

  }



  /** GET /qr/preview/:plantId */

  async function fetchPreview(plantId: string) {

    previewLoading.value = true;

    previewError.value = null;

    try {

      preview.value = await fetchQrPreview(plantId);

    } catch (error) {

      preview.value = null;

      previewError.value = extractErrorMessage(error, 'QR 미리보기를 불러오지 못했습니다');

    } finally {

      previewLoading.value = false;

    }

  }



  async function fetchPublicPreviewByPlantId(plantId: string) {

    const item = items.value.find((i) => i.plantId === plantId);

    if (!item) return;

    await fetchPublicPreview(item.qrCode);

  }



  /** GET /public/plants/:qrCode — 공개 페이지 검증 */

  async function fetchPublicPreview(qrCode: string) {

    publicLoading.value = true;

    publicError.value = null;

    try {

      publicPreview.value = await fetchPublicPlantByQrCode(qrCode);

    } catch (error) {

      publicPreview.value = null;

      publicError.value = extractErrorMessage(error, '공개 QR 조회에 실패했습니다');

    } finally {

      publicLoading.value = false;

    }

  }



  return {

    items,

    searchQuery,

    selectedId,

    preview,

    previewLoading,

    previewError,

    publicPreview,

    publicLoading,

    publicError,

    listLoading,

    listError,

    filtered,

    selected,

    setSearch,

    selectPlant,

    fetchQrList,

    fetchPreview,

    fetchPublicPreview,

  };

});


