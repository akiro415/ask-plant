import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
  fetchCommonCodes,
  fetchCommonCodeGroups,
  createCommonCode as createCommonCodeApi,
  updateCommonCode as updateCommonCodeApi,
  updateCommonCodeGroup as updateCommonCodeGroupApi,
  deleteCommonCode as deleteCommonCodeApi,
  type CreateCommonCodePayload,
  type UpdateCommonCodePayload,
  type CommonCodeGroupDto,
} from '@/api/common-code.api';
import { extractErrorMessage } from '@/api/http';
import type { CommonCode } from '@/types/common';

export interface CommonCodeGroupSummary {
  groupCode: string;
  label: string;
  totalCount: number;
  activeCount: number;
}

export const useCommonCodeStore = defineStore('commonCode', () => {
  const codes = ref<CommonCode[]>([]);
  const groups = ref<CommonCodeGroupDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const selectedGroupCode = ref<string | null>(null);
  const searchKeyword = ref('');

  const formLoading = ref(false);
  const formError = ref<string | null>(null);
  const groupFormLoading = ref(false);
  const groupFormError = ref<string | null>(null);
  const deleteLoadingId = ref<string | null>(null);
  const deleteError = ref<string | null>(null);

  const keyword = computed(() => searchKeyword.value.trim().toLowerCase());

  function matchesKeyword(target: string): boolean {
    return keyword.value.length === 0 || target.toLowerCase().includes(keyword.value);
  }

  const groupSummaries = computed<CommonCodeGroupSummary[]>(() =>
    groups.value
      .map((g) => ({
        groupCode: g.groupCode,
        label: g.name,
        totalCount: g.totalCount,
        activeCount: g.activeCount,
      }))
      .sort((a, b) => a.groupCode.localeCompare(b.groupCode)),
  );

  const filteredGroupSummaries = computed<CommonCodeGroupSummary[]>(() => {
    if (!keyword.value) return groupSummaries.value;
    return groupSummaries.value.filter((group) => {
      if (matchesKeyword(group.groupCode) || matchesKeyword(group.label)) return true;
      return codes.value.some(
        (c) => c.groupCode === group.groupCode && (matchesKeyword(c.code) || matchesKeyword(c.name)),
      );
    });
  });

  const codesInSelectedGroup = computed<CommonCode[]>(() => {
    if (!selectedGroupCode.value) return [];
    return codes.value
      .filter((c) => c.groupCode === selectedGroupCode.value)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  });

  const filteredCodes = computed<CommonCode[]>(() => {
    if (!keyword.value) return codesInSelectedGroup.value;
    return codesInSelectedGroup.value.filter(
      (c) => matchesKeyword(c.groupCode) || matchesKeyword(c.code) || matchesKeyword(c.name),
    );
  });

  function selectGroup(groupCode: string) {
    selectedGroupCode.value = groupCode;
  }

  function setSearchKeyword(value: string) {
    searchKeyword.value = value;
  }

  watch(filteredGroupSummaries, (list) => {
    if (list.length === 0) return;
    const stillVisible = list.some((g) => g.groupCode === selectedGroupCode.value);
    if (!stillVisible) {
      selectedGroupCode.value = list[0].groupCode;
    }
  });

  async function fetchCodes() {
    loading.value = true;
    error.value = null;
    try {
      const [codeRows, groupRows] = await Promise.all([fetchCommonCodes(undefined, true), fetchCommonCodeGroups()]);
      codes.value = codeRows;
      groups.value = groupRows;
      loaded.value = true;
      if (!selectedGroupCode.value && groupSummaries.value.length > 0) {
        selectedGroupCode.value = groupSummaries.value[0].groupCode;
      }
    } catch (e) {
      error.value = extractErrorMessage(e, '공통코드를 불러오지 못했습니다');
    } finally {
      loading.value = false;
    }
  }

  async function ensureLoaded() {
    if (!loaded.value && !loading.value) {
      await fetchCodes();
    }
  }

  async function createCode(payload: CreateCommonCodePayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await createCommonCodeApi(payload);
      await fetchCodes();
      if (payload.groupCode) {
        selectedGroupCode.value = payload.groupCode;
      }
      return true;
    } catch (e) {
      formError.value = extractErrorMessage(e, '공통코드 등록에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  async function updateCode(id: string, payload: UpdateCommonCodePayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await updateCommonCodeApi(id, payload);
      await fetchCodes();
      return true;
    } catch (e) {
      formError.value = extractErrorMessage(e, '공통코드 수정에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  async function updateGroupLabel(groupCode: string, name: string): Promise<boolean> {
    groupFormLoading.value = true;
    groupFormError.value = null;
    try {
      await updateCommonCodeGroupApi(groupCode, name);
      await fetchCodes();
      return true;
    } catch (e) {
      groupFormError.value = extractErrorMessage(e, '그룹명 수정에 실패했습니다');
      return false;
    } finally {
      groupFormLoading.value = false;
    }
  }

  async function deleteCode(id: string): Promise<boolean> {
    deleteLoadingId.value = id;
    deleteError.value = null;
    try {
      await deleteCommonCodeApi(id);
      await fetchCodes();
      return true;
    } catch (e) {
      deleteError.value = extractErrorMessage(e, '공통코드 삭제에 실패했습니다');
      return false;
    } finally {
      deleteLoadingId.value = null;
    }
  }

  return {
    codes,
    groups,
    loading,
    error,
    loaded,
    selectedGroupCode,
    searchKeyword,
    groupSummaries,
    filteredGroupSummaries,
    codesInSelectedGroup,
    filteredCodes,
    formLoading,
    formError,
    groupFormLoading,
    groupFormError,
    deleteLoadingId,
    deleteError,
    selectGroup,
    setSearchKeyword,
    fetchCodes,
    ensureLoaded,
    createCode,
    updateCode,
    updateGroupLabel,
    deleteCode,
  };
});
