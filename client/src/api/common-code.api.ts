import { httpClient } from './http';
import type { CommonCode } from '@/types/common';

interface CommonCodeListResponse {
  data: CommonCode[];
}

/**
 * GET /api/v1/common-codes?groupCode=... — select 옵션은 항상 id를 value로 사용한다.
 * groupCode를 생략하면 전체 그룹의 코드를 한 번에 조회한다(공통코드 관리 화면에서 사용).
 */
export async function fetchCommonCodes(groupCode?: string): Promise<CommonCode[]> {
  const { data } = await httpClient.get<CommonCodeListResponse>('/common-codes', {
    params: groupCode ? { groupCode } : undefined,
  });
  return data.data;
}
