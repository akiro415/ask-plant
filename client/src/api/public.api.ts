import { httpClient } from './http';
import type { PublicPlant, PublicPlantListItem, PublicPlantListParams } from '@/types/public';

/** @deprecated PublicPlant 사용 */
export type PublicPlantDto = PublicPlant;

interface PublicPlantResponse {
  data: PublicPlant;
}

interface PublicPlantListResponse {
  data: PublicPlantListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/** GET /api/v1/public/plants — 공개 판매 목록 */
export async function fetchPublicPlants(params: PublicPlantListParams = {}) {
  const { data } = await httpClient.get<PublicPlantListResponse>('/public/plants', { params });
  return { items: data.data, meta: data.meta };
}

/** GET /api/v1/public/plants/:qrCode — 인증 불필요, QR 공개 조회 */
export async function fetchPublicPlantByQrCode(qrCode: string): Promise<PublicPlant> {
  const { data } = await httpClient.get<PublicPlantResponse>(`/public/plants/${encodeURIComponent(qrCode)}`);
  return data.data;
}
