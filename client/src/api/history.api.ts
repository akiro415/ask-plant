import { httpClient } from './http';
import type { PlantHistory } from '@/types/history';
import type { DashboardRecentHistoryItem } from '@/types/dashboard';

export interface RecentHistoryApiRow {
  id: string;
  plantId: string;
  qrCode: string;
  plantName: string;
  historyType: { code: string; name: string };
  performedAt: string;
  amount: number | null;
  title: string | null;
}

interface HistoryListResponse {
  data: PlantHistoryApiRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface RecentHistoryListResponse {
  data: RecentHistoryApiRow[];
}

/** GET /plants/:id/histories 응답 행 — server HistoryDto와 대응 */
export interface PlantHistoryApiRow {
  id: string;
  plantId: string;
  historyType: { id: string; code: string; name: string };
  performedAt: string;
  performedBy: { id: string; name: string } | null;
  title: string | null;
  description: string | null;
  amount: number | null;
  fromLocation: { id: string; name: string } | null;
  toLocation: { id: string; name: string } | null;
  image: { id: string; url: string } | null;
  metadata: Record<string, unknown> | null;
}

function toPlantHistory(row: PlantHistoryApiRow): PlantHistory {
  return {
    id: row.id,
    plantId: row.plantId,
    historyType: {
      id: row.historyType.id,
      groupCode: 'HISTORY_TYPE',
      code: row.historyType.code,
      name: row.historyType.name,
      sortOrder: 0,
    },
    performedAt: row.performedAt,
    performedBy: row.performedBy?.name ?? null,
    title: row.title,
    description: row.description,
    amount: row.amount,
    fromLocation: row.fromLocation,
    toLocation: row.toLocation,
    image: row.image,
    metadata: row.metadata,
  };
}

function toDashboardRecentItem(row: RecentHistoryApiRow): DashboardRecentHistoryItem {
  return {
    plantId: row.plantId,
    qrCode: row.qrCode,
    plantName: row.plantName,
    amount: row.amount,
    performedAt: row.performedAt,
  };
}

/** GET /api/v1/plants/:id/histories */
export async function fetchPlantHistories(plantId: string): Promise<PlantHistory[]> {
  const { data } = await httpClient.get<HistoryListResponse>(`/plants/${plantId}/histories`);
  return data.data.map(toPlantHistory);
}

/** GET /api/v1/histories/recent?type=REPOT&limit=5 */
export async function fetchRecentHistories(type: string, limit = 5): Promise<DashboardRecentHistoryItem[]> {
  const { data } = await httpClient.get<RecentHistoryListResponse>('/histories/recent', {
    params: { type, limit },
  });
  return data.data.map(toDashboardRecentItem);
}

export interface CreateHistoryPayload {
  type: string;
  description?: string | null;
  performedAt?: string;
  title?: string | null;
  amount?: number | null;
}

export type UpdateHistoryPayload = Partial<CreateHistoryPayload>;

interface HistoryItemResponse {
  data: PlantHistoryApiRow;
}

/** POST /api/v1/plants/:id/histories */
export async function createPlantHistory(plantId: string, payload: CreateHistoryPayload): Promise<PlantHistory> {
  const { data } = await httpClient.post<HistoryItemResponse>(`/plants/${plantId}/histories`, payload);
  return toPlantHistory(data.data);
}

/** PUT /api/v1/histories/:id */
export async function updateHistory(id: string, payload: UpdateHistoryPayload): Promise<PlantHistory> {
  const { data } = await httpClient.put<HistoryItemResponse>(`/histories/${id}`, payload);
  return toPlantHistory(data.data);
}

/** DELETE /api/v1/histories/:id */
export async function deleteHistory(id: string): Promise<void> {
  await httpClient.delete(`/histories/${id}`);
}
