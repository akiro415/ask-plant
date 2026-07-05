import { dashboardRepository } from '../repositories/dashboard.repository';
import { isAdmin } from '../lib/rbac';
import type { AuthenticatedUser } from '../types/express';

const RECENT_PLANTS_LIMIT = 5;

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
  createdAt: Date;
}

export interface DashboardUserStatDto {
  userId: string;
  name: string;
  email: string;
  role: string;
  plantCount: number;
  salesTotal: number;
  lastActivityAt: Date | null;
}

export interface DashboardSummaryDto {
  plantCount: number;
  speciesCount: number;
  locationCount: number;
  recentPlants: DashboardRecentPlantDto[];
  statusDistribution: DashboardStatusCountDto[];
  /** ADMIN 전용 */
  customerCount?: number;
  nonStaffUserCount?: number;
  userStats?: DashboardUserStatDto[];
}

export const dashboardService = {
  /** ADMIN/STAFF 대시보드 — ADMIN은 사용자별 통계 추가 */
  async getSummary(requestUser: AuthenticatedUser): Promise<DashboardSummaryDto> {
    const [plantCount, speciesCount, locationCount, statusGroups, recentRows] = await Promise.all([
      dashboardRepository.countPlants(),
      dashboardRepository.countSpecies(),
      dashboardRepository.countLocations(),
      dashboardRepository.statusDistribution(),
      dashboardRepository.recentPlants(RECENT_PLANTS_LIMIT),
    ]);

    const commonCodes = await dashboardRepository.findCommonCodesByIds(statusGroups.map((g) => g.statusId));
    const commonCodeById = new Map(commonCodes.map((c) => [c.id, c]));

    const statusDistribution: DashboardStatusCountDto[] = statusGroups
      .map((group) => {
        const code = commonCodeById.get(group.statusId);
        return {
          code: code?.code ?? 'UNKNOWN',
          name: code?.name ?? '알 수 없음',
          count: group.count,
          sortOrder: code?.sortOrder ?? Number.MAX_SAFE_INTEGER,
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ code, name, count }) => ({ code, name, count }));

    const base: DashboardSummaryDto = {
      plantCount,
      speciesCount,
      locationCount,
      recentPlants: recentRows.map((row) => ({
        id: row.id,
        qrCode: row.qrCode,
        nickname: row.nickname,
        species: {
          id: row.species.id,
          displayName: row.species.displayName,
          scientificName: row.species.scientificName,
          koreanName: row.species.koreanName,
        },
        status: { code: row.status.code, name: row.status.name },
        createdAt: row.createdAt,
      })),
      statusDistribution,
    };

    if (!isAdmin(requestUser)) return base;

    const [customerCount, nonStaffUserCount, plantByOwner, salesByOwner] = await Promise.all([
      dashboardRepository.countActiveCustomers(),
      dashboardRepository.countNonStaffUsers(),
      dashboardRepository.plantCountByOwner(),
      dashboardRepository.salesTotalByOwner(),
    ]);

    const ownerIds = [...new Set([...plantByOwner.map((p) => p.ownerId), ...salesByOwner.map((s) => s.ownerId)])];
    const users = await dashboardRepository.findUsersByIds(ownerIds);
    const plantCountMap = new Map(plantByOwner.map((p) => [p.ownerId, p.count]));
    const salesMap = new Map(salesByOwner.map((s) => [s.ownerId, s.total]));

    const userStats: DashboardUserStatDto[] = users
      .map((u) => ({
        userId: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        plantCount: plantCountMap.get(u.id) ?? 0,
        salesTotal: salesMap.get(u.id) ?? 0,
        lastActivityAt: u.updatedAt,
      }))
      .sort((a, b) => b.plantCount - a.plantCount);

    return {
      ...base,
      customerCount,
      nonStaffUserCount,
      userStats,
    };
  },
};
