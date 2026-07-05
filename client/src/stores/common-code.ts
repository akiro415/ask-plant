import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { fetchCommonCodes } from '@/api/common-code.api';
import { extractErrorMessage } from '@/api/http';
import type { CommonCode } from '@/types/common';

/** 알려진 groupCode에 대한 한글 라벨. 목록에 없는 그룹은 groupCode를 그대로 표시한다(확장 가능). */
const GROUP_LABELS: Record<string, string> = {
  PLANT_STATUS: '식물 상태',
  HISTORY_TYPE: '이력 유형',
  LOCATION_TYPE: '위치 유형',
  ORIGIN_TYPE: '기원(번식) 유형',
};

export interface CommonCodeGroupSummary {
  groupCode: string;
  label: string;
  totalCount: number;
  activeCount: number;
}

export const useCommonCodeStore = defineStore('commonCode', () => {
  const codes = ref<CommonCode[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const selectedGroupCode = ref<string | null>(null);
  const searchKeyword = ref('');

  const keyword = computed(() => searchKeyword.value.trim().toLowerCase());

  function matchesKeyword(target: string): boolean {
    return keyword.value.length === 0 || target.toLowerCase().includes(keyword.value);
  }

  /** groupCode 기준으로 묶은 좌측 그룹 목록 (전체, 검색어 적용 전). */
  const groupSummaries = computed<CommonCodeGroupSummary[]>(() => {
    const map = new Map<string, CommonCode[]>();
    for (const c of codes.value) {
      const list = map.get(c.groupCode) ?? [];
      list.push(c);
      map.set(c.groupCode, list);
    }
    return Array.from(map.entries())
      .map(([groupCode, list]) => ({
        groupCode,
        label: GROUP_LABELS[groupCode] ?? groupCode,
        totalCount: list.length,
        activeCount: list.filter((c) => c.isActive !== false).length,
      }))
      .sort((a, b) => a.groupCode.localeCompare(b.groupCode));
  });

  /** 검색어가 groupCode/label 또는 해당 그룹 소속 code/name 중 하나라도 일치하면 그룹을 노출한다. */
  const filteredGroupSummaries = computed<CommonCodeGroupSummary[]>(() => {
    if (!keyword.value) return groupSummaries.value;
    return groupSummaries.value.filter((group) => {
      if (matchesKeyword(group.groupCode) || matchesKeyword(group.label)) return true;
      return codes.value.some(
        (c) => c.groupCode === group.groupCode && (matchesKeyword(c.code) || matchesKeyword(c.name)),
      );
    });
  });

  /** 현재 선택된 그룹에 속한 전체 코드 (검색어 적용 전, sortOrder 기준 정렬). */
  const codesInSelectedGroup = computed<CommonCode[]>(() => {
    if (!selectedGroupCode.value) return [];
    return codes.value
      .filter((c) => c.groupCode === selectedGroupCode.value)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  });

  /** 우측 그리드에 실제로 표시되는 코드 목록 — 선택된 그룹 + 검색어 필터 적용. */
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

  // 검색어 때문에 현재 선택된 그룹이 좌측 목록에서 사라지면, 보이는 첫 번째 그룹으로 자동 전환한다.
  watch(filteredGroupSummaries, (groups) => {
    if (groups.length === 0) return;
    const stillVisible = groups.some((g) => g.groupCode === selectedGroupCode.value);
    if (!stillVisible) {
      selectedGroupCode.value = groups[0].groupCode;
    }
  });

  /** GET /api/v1/common-codes (전체 조회) 후 프론트에서 groupCode 기준으로 묶어 사용한다. */
  async function fetchCodes() {
    loading.value = true;
    error.value = null;
    try {
      codes.value = await fetchCommonCodes();
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

  return {
    codes,
    loading,
    error,
    loaded,
    selectedGroupCode,
    searchKeyword,
    groupSummaries,
    filteredGroupSummaries,
    codesInSelectedGroup,
    filteredCodes,
    selectGroup,
    setSearchKeyword,
    fetchCodes,
    ensureLoaded,
  };
});
