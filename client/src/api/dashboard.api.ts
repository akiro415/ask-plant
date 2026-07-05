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

export interface DashboardRecentUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface DashboardUserStatDto {
  userId: string;
  name: string;
  email: string;
  role: string;
  plantCount: number;
  salesTotal: number;
  lastActivityAt: string | null;
}

export interface DashboardSummaryDto {
  plantCount: number;
  speciesCount: number;
  locationCount: number;
  userCount?: number;
  forSaleCount?: number;
  reservedCount?: number;
  soldCount?: number;
  recentPlants: DashboardRecentPlantDto[];
  recentUsers?: DashboardRecentUserDto[];
  statusDistribution: DashboardStatusCountDto[];
  customerCount?: number;
  nonStaffUserCount?: number;
  userStats?: DashboardUserStatDto[];
}

export interface CustomerDashboardDto {
  plantCount: number;
  locationCount: number;
  forSaleCount: number;
  reservedCount: number;
  soldCount: number;
  statusDistribution: DashboardStatusCountDto[];
  recentPlants: DashboardRecentPlantDto[];
}

interface DashboardSummaryResponse {
  data: DashboardSummaryDto;
}

interface CustomerDashboardResponse {
  data: CustomerDashboardDto;
}

export async function fetchDashboardSummary(): Promise<DashboardSummaryDto> {
  const { data } = await httpClient.get<DashboardSummaryResponse>('/dashboard');
  return data.data;
}

export async function fetchMyDashboard(): Promise<CustomerDashboardDto> {
  const { data } = await httpClient.get<CustomerDashboardResponse>('/dashboard/me');
  return data.data;
}
