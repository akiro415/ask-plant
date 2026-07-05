import { httpClient } from './http';

export interface SpeciesCategoryRef {
  id: string;
  code: string;
  name: string;
}

export interface SpeciesOption {
  id: string;
  displayName: string;
  scientificName: string | null;
  koreanName: string | null;
  category: SpeciesCategoryRef | null;
}

/**
 * GET /api/v1/species 응답 전체 필드 — server/src/services/species.service.ts의 SpeciesDetailDto와 대응.
 * 목록 화면(SpeciesListView)/상세 화면(SpeciesDetailView)에서 필요한 전 필드를 포함한다.
 */
export interface SpeciesListItem extends SpeciesOption {
  englishName: string | null;
  fieldNumber: string | null;
  sellerName: string | null;
  taxonRank: 'SPECIES' | 'SP' | 'SSP' | 'VARIETY' | 'CULTIVAR' | 'HYBRID';
  isHybrid: boolean;
  parentSpecies1Id: string | null;
  parentSpecies2Id: string | null;
  genus: string | null;
  family: string | null;
  careGuide: string | null;
  defaultWateringCycleDays: number | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SpeciesListResponse {
  data: SpeciesListItem[];
}

interface SpeciesItemResponse {
  data: SpeciesListItem;
}

/** POST/PUT /api/v1/species 요청 바디 — server/src/schemas/species.schema.ts의 createSpeciesSchema와 대응. */
export interface CreateSpeciesPayload {
  displayName: string;
  scientificName?: string | null;
  englishName?: string | null;
  koreanName?: string | null;
  fieldNumber?: string | null;
  sellerName?: string | null;
  taxonRank?: SpeciesListItem['taxonRank'];
  isHybrid?: boolean;
  parentSpecies1Id?: string | null;
  parentSpecies2Id?: string | null;
  categoryId?: string | null;
  genus?: string | null;
  family?: string | null;
  description?: string | null;
  careGuide?: string | null;
  defaultWateringCycleDays?: number | null;
  thumbnailUrl?: string | null;
}

export type UpdateSpeciesPayload = Partial<CreateSpeciesPayload> & { isActive?: boolean };

/** GET /api/v1/species — Plant 등록 폼의 품종 select 옵션 (value=id, label=displayName) */
export async function fetchSpeciesOptions(): Promise<SpeciesOption[]> {
  const { data } = await httpClient.get<SpeciesListResponse>('/species');
  return data.data;
}

/** GET /api/v1/species — 품종관리(목록/상세) 화면에서 필요한 전 필드 포함 조회. 기본은 활성 품종만 반환한다. */
export async function fetchSpeciesList(): Promise<SpeciesListItem[]> {
  const { data } = await httpClient.get<SpeciesListResponse>('/species');
  return data.data;
}

/** POST /api/v1/species — ADMIN/STAFF 전용 */
export async function createSpecies(payload: CreateSpeciesPayload): Promise<SpeciesListItem> {
  const { data } = await httpClient.post<SpeciesItemResponse>('/species', payload);
  return data.data;
}

/** PUT /api/v1/species/:id — ADMIN/STAFF 전용 */
export async function updateSpecies(id: string, payload: UpdateSpeciesPayload): Promise<SpeciesListItem> {
  const { data } = await httpClient.put<SpeciesItemResponse>(`/species/${id}`, payload);
  return data.data;
}

/** DELETE /api/v1/species/:id — ADMIN/STAFF 전용. 서버에서 isActive=false로 Soft Delete 처리한다. */
export async function deleteSpecies(id: string): Promise<void> {
  await httpClient.delete(`/species/${id}`);
}
