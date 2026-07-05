import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PlantHistory } from '@/types/history';
import type { CommonCode } from '@/types/common';
import {
  fetchPlantHistories,
  createPlantHistory as createPlantHistoryApi,
  updateHistory as updateHistoryApi,
  deleteHistory as deleteHistoryApi,
  type CreateHistoryPayload,
  type UpdateHistoryPayload,
} from '@/api/history.api';
import { fetchCommonCodes } from '@/api/common-code.api';
import { extractErrorMessage } from '@/api/http';

export const useHistoryStore = defineStore('history', () => {
  const histories = ref<PlantHistory[]>([]);
  const listLoading = ref(false);
  const listError = ref<string | null>(null);

  const typeOptions = ref<CommonCode[]>([]);
  const typeOptionsLoaded = ref(false);

  const formLoading = ref(false);
  const formError = ref<string | null>(null);
  const deleteLoadingId = ref<string | null>(null);
  const deleteError = ref<string | null>(null);

  async function ensureTypeOptionsLoaded() {
    if (typeOptionsLoaded.value) return;
    try {
      typeOptions.value = await fetchCommonCodes('HISTORY_TYPE');
      typeOptionsLoaded.value = true;
    } catch {
      // 보조 데이터 — 실패해도 폼은 type 문자열로 제출 가능
    }
  }

  /** GET /api/v1/plants/:id/histories */
  async function fetchByPlantId(plantId: string) {
    listLoading.value = true;
    listError.value = null;
    try {
      histories.value = await fetchPlantHistories(plantId);
    } catch (error) {
      listError.value = extractErrorMessage(error, '이력 목록을 불러오지 못했습니다');
    } finally {
      listLoading.value = false;
    }
  }

  /** POST /api/v1/plants/:id/histories */
  async function createHistory(plantId: string, payload: CreateHistoryPayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await createPlantHistoryApi(plantId, payload);
      await fetchByPlantId(plantId);
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '이력 등록에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** PUT /api/v1/histories/:id */
  async function updateHistory(id: string, plantId: string, payload: UpdateHistoryPayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await updateHistoryApi(id, payload);
      await fetchByPlantId(plantId);
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '이력 수정에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** DELETE /api/v1/histories/:id */
  async function deleteHistory(id: string, plantId: string): Promise<boolean> {
    deleteLoadingId.value = id;
    deleteError.value = null;
    try {
      await deleteHistoryApi(id);
      await fetchByPlantId(plantId);
      return true;
    } catch (error) {
      deleteError.value = extractErrorMessage(error, '이력 삭제에 실패했습니다');
      return false;
    } finally {
      deleteLoadingId.value = null;
    }
  }

  return {
    histories,
    listLoading,
    listError,
    typeOptions,
    formLoading,
    formError,
    deleteLoadingId,
    deleteError,
    ensureTypeOptionsLoaded,
    fetchByPlantId,
    createHistory,
    updateHistory,
    deleteHistory,
  };
});
