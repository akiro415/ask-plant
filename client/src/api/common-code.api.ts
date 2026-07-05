import { httpClient } from './http';
import type { CommonCode } from '@/types/common';

interface CommonCodeListResponse {
  data: CommonCode[];
}

interface CommonCodeItemResponse {
  data: CommonCode;
}

export interface CreateCommonCodePayload {
  groupCode: string;
  code: string;
  name: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateCommonCodePayload = Partial<CreateCommonCodePayload>;

export interface CommonCodeGroupDto {
  groupCode: string;
  name: string;
  totalCount: number;
  activeCount: number;
}

/**
 * GET /api/v1/common-codes?groupCode=...&includeInactive=...
 * select 옵션은 항상 id를 value로 사용한다.
 */
export async function fetchCommonCodes(groupCode?: string, includeInactive = false): Promise<CommonCode[]> {
  const params: Record<string, string | boolean> = {};
  if (groupCode) params.groupCode = groupCode;
  if (includeInactive) params.includeInactive = true;
  const { data } = await httpClient.get<CommonCodeListResponse>('/common-codes', {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return data.data;
}

/** GET /api/v1/common-codes/groups — 그룹 목록(표시명 포함) */
export async function fetchCommonCodeGroups(): Promise<CommonCodeGroupDto[]> {
  const { data } = await httpClient.get<{ data: CommonCodeGroupDto[] }>('/common-codes/groups');
  return data.data;
}

/** PUT /api/v1/common-codes/groups/:groupCode — 그룹 표시명만 수정 */
export async function updateCommonCodeGroup(groupCode: string, name: string): Promise<CommonCodeGroupDto> {
  const { data } = await httpClient.put<{ data: CommonCodeGroupDto }>(`/common-codes/groups/${encodeURIComponent(groupCode)}`, { name });
  return data.data;
}

/** POST /api/v1/common-codes — ADMIN/STAFF 전용 */
export async function createCommonCode(payload: CreateCommonCodePayload): Promise<CommonCode> {
  const { data } = await httpClient.post<CommonCodeItemResponse>('/common-codes', payload);
  return data.data;
}

/** PUT /api/v1/common-codes/:id — ADMIN/STAFF 전용 */
export async function updateCommonCode(id: string, payload: UpdateCommonCodePayload): Promise<CommonCode> {
  const { data } = await httpClient.put<CommonCodeItemResponse>(`/common-codes/${id}`, payload);
  return data.data;
}


/** DELETE /api/v1/common-codes/:id — ADMIN/STAFF 전용. 서버에서 isActive=false로 Soft Delete 처리한다. */
export async function deleteCommonCode(id: string): Promise<CommonCode> {
  const { data } = await httpClient.delete<CommonCodeItemResponse>(`/common-codes/${id}`);
  return data.data;
}
