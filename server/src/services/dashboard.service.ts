import { dashboardRepository } from '../repositories/dashboard.repository';

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

export interface DashboardSummaryDto {
  plantCount: number;
  speciesCount: number;
  locationCount: number;
  recentPlants: DashboardRecentPlantDto[];
  statusDistribution: DashboardStatusCountDto[];
}

export const dashboardService = {
  /** ADMIN/STAFF 전용 대시보드 요약 — 개수/최근 개체/상태 분포를 Prisma 집계(count/groupBy)로 조회한다. */
  async getSummary(): Promise<DashboardSummaryDto> {
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

    return {
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
  },
};
