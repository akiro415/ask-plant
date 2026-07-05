import { httpClient } from './http';
import type { PlantImage, ImageType } from '@/types/image';
import type { DashboardRecentImageItem } from '@/types/dashboard';

export interface ImageApiRow {
  id: string;
  plantId: string;
  url: string;
  imageType: ImageType;
  caption: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  plant: { id: string; qrCode: string; displayName: string };
}

export interface RecentImageApiRow {
  id: string;
  plantId: string;
  qrCode: string;
  imageUrl: string;
  imageType: string;
  createdAt: string;
}

interface ImageListResponse {
  data: ImageApiRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface RecentImageListResponse {
  data: RecentImageApiRow[];
}

function toPlantImage(row: ImageApiRow): PlantImage {
  return {
    id: row.id,
    plantId: row.plantId,
    url: row.url,
    imageType: row.imageType,
    caption: row.caption,
    isPrimary: row.isPrimary,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  };
}

function toDashboardRecentImage(row: RecentImageApiRow): DashboardRecentImageItem {
  return {
    plantId: row.plantId,
    qrCode: row.qrCode,
    imageUrl: row.imageUrl,
    imageType: row.imageType,
    createdAt: row.createdAt,
  };
}

/** GET /api/v1/plants/:id/images */
export async function fetchPlantImages(plantId: string): Promise<PlantImage[]> {
  const { data } = await httpClient.get<ImageListResponse>(`/plants/${plantId}/images`);
  return data.data.map(toPlantImage);
}

/** GET /api/v1/images — 사진관리 화면 전체 목록 */
export async function fetchImages(params?: { imageType?: ImageType; limit?: number }): Promise<ImageApiRow[]> {
  const { data } = await httpClient.get<ImageListResponse>('/images', {
    params: { limit: params?.limit ?? 100, imageType: params?.imageType },
  });
  return data.data;
}

/** GET /api/v1/images/recent?limit=5 */
export async function fetchRecentImages(limit = 5): Promise<DashboardRecentImageItem[]> {
  const { data } = await httpClient.get<RecentImageListResponse>('/images/recent', { params: { limit } });
  return data.data.map(toDashboardRecentImage);
}

export interface CreateImagePayload {
  url?: string;
  imageUrl?: string;
  imageType?: ImageType;
  caption?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export type UpdateImagePayload = Partial<CreateImagePayload>;

interface ImageItemResponse {
  data: ImageApiRow;
}

/** POST /api/v1/plants/:id/images */
export async function createPlantImage(plantId: string, payload: CreateImagePayload): Promise<ImageApiRow> {
  const { data } = await httpClient.post<ImageItemResponse>(`/plants/${plantId}/images`, payload);
  return data.data;
}

/** PUT /api/v1/images/:id */
export async function updateImage(id: string, payload: UpdateImagePayload): Promise<ImageApiRow> {
  const { data } = await httpClient.put<ImageItemResponse>(`/images/${id}`, payload);
  return data.data;
}

/** DELETE /api/v1/images/:id */
export async function deleteImage(id: string): Promise<void> {
  await httpClient.delete(`/images/${id}`);
}
