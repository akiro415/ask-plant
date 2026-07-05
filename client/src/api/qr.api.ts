import { httpClient } from './http';
import type { QrListItem, QrPreview } from '@/types/qr';

interface QrListResponse {
  data: QrListItem[];
}

interface QrPreviewResponse {
  data: QrPreview;
}

export interface ListQrParams {
  plantId?: string;
  q?: string;
  limit?: number;
}

/** GET /api/v1/qr/list — QR 발급 목록 */
export async function fetchQrList(params: ListQrParams = {}): Promise<QrListItem[]> {
  const { data } = await httpClient.get<QrListResponse>('/qr/list', { params });
  return data.data;
}

/** GET /api/v1/qr/preview/:plantId — QR 미리보기 메타 */
export async function fetchQrPreview(plantId: string): Promise<QrPreview> {
  const { data } = await httpClient.get<QrPreviewResponse>(`/qr/preview/${encodeURIComponent(plantId)}`);
  return data.data;
}
