import { httpClient } from './http';

export interface DashboardStatusCountDto {
  code: string;
  name: string;
  count: number;
}

export interface DashboardRecentPlantDto {
  id: string;
  qrCode: string;
  nickname: string | null;
  species: { id: string; displayName: string; scientificName: string | null; koreanName: string | null };
  status: { code: string; name: string };
  createdAt: string;
}

/** GET /api/v1/dashboard 응답 — server/src/services/dashboard.service.ts의 DashboardSummaryDto와 대응. ADMIN/STAFF 전용. */
export interface DashboardSummaryDto {
  plantCount: number;
  speciesCount: number;
  locationCount: number;
  recentPlants: DashboardRecentPlantDto[];
  statusDistribution: DashboardStatusCountDto[];
}

interface DashboardSummaryResponse {
  data: DashboardSummaryDto;
}

/** GET /api/v1/dashboard — plant/species/location 스토어를 각각 로드해 집계하던 방식을 대체하는 단일 호출. */
export async function fetchDashboardSummary(): Promise<DashboardSummaryDto> {
  const { data } = await httpClient.get<DashboardSummaryResponse>('/dashboard');
  return data.data;
}
