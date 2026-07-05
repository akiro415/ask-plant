import { httpClient } from './http';

export interface LocationRefDto {
  id: string;
  code: string;
  name: string;
}

/** GET /api/v1/locations 응답 — server/src/services/location.service.ts의 LocationDto와 대응 */
export interface LocationApiRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  ownerId: string;
  typeId: string | null;
  parentId: string | null;
  imagePath: string | null;
  posX: number | null;
  posY: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  type: LocationRefDto | null;
  parent: LocationRefDto | null;
}

interface LocationListResponse {
  data: LocationApiRow[];
}

interface LocationItemResponse {
  data: LocationApiRow;
}

/** POST/PUT /api/v1/locations 요청 바디 — server/src/schemas/location.schema.ts의 createLocationSchema와 대응. */
export interface CreateLocationPayload {
  code: string;
  name: string;
  description?: string | null;
  typeId?: string | null;
  parentId?: string | null;
  imagePath?: string | null;
  posX?: number | null;
  posY?: number | null;
  sortOrder?: number;
}

export type UpdateLocationPayload = Partial<CreateLocationPayload> & { isActive?: boolean };

/** GET /api/v1/locations — 위치관리 화면 목록 조회. 기본은 활성 위치만 반환한다. */
export async function fetchLocations(): Promise<LocationApiRow[]> {
  const { data } = await httpClient.get<LocationListResponse>('/locations');
  return data.data;
}

/** POST /api/v1/locations — ADMIN/STAFF 전용 */
export async function createLocation(payload: CreateLocationPayload): Promise<LocationApiRow> {
  const { data } = await httpClient.post<LocationItemResponse>('/locations', payload);
  return data.data;
}

/** PUT /api/v1/locations/:id — ADMIN/STAFF 전용 */
export async function updateLocation(id: string, payload: UpdateLocationPayload): Promise<LocationApiRow> {
  const { data } = await httpClient.put<LocationItemResponse>(`/locations/${id}`, payload);
  return data.data;
}

/** DELETE /api/v1/locations/:id — ADMIN/STAFF 전용. 서버에서 isActive=false로 Soft Delete 처리한다. */
export async function deleteLocation(id: string): Promise<void> {
  await httpClient.delete(`/locations/${id}`);
}
