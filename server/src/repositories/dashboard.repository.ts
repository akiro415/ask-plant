import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

const recentPlantSelect = {
  id: true,
  qrCode: true,
  nickname: true,
  createdAt: true,
  species: { select: { id: true, displayName: true, scientificName: true, koreanName: true } },
  status: { select: { code: true, name: true } },
} satisfies Prisma.PlantSelect;

export type RecentPlantRow = Prisma.PlantGetPayload<{ select: typeof recentPlantSelect }>;

export interface StatusGroupRow {
  statusId: string;
  count: number;
}

export const dashboardRepository = {
  async countPlants(): Promise<number> {
    return prisma.plant.count({ where: { deletedAt: null } });
  },

  async countSpecies(): Promise<number> {
    return prisma.species.count({ where: { isActive: true } });
  },

  async countLocations(): Promise<number> {
    return prisma.plantLocation.count({ where: { isActive: true } });
  },

  /** Prisma groupBy 집계 — 삭제되지 않은 개체를 statusId 기준으로 그룹핑해 상태별 개수를 구한다. */
  async statusDistribution(): Promise<StatusGroupRow[]> {
    const rows = await prisma.plant.groupBy({
      by: ['statusId'],
      where: { deletedAt: null },
      _count: { _all: true },
      orderBy: { _count: { statusId: 'desc' } },
    });
    return rows.map((row) => ({ statusId: row.statusId, count: row._count._all }));
  },

  /** statusDistribution의 statusId를 code/name/sortOrder로 변환하기 위한 CommonCode 조회 */
  async findCommonCodesByIds(ids: string[]): Promise<{ id: string; code: string; name: string; sortOrder: number }[]> {
    if (ids.length === 0) return [];
    return prisma.commonCode.findMany({
      where: { id: { in: ids } },
      select: { id: true, code: true, name: true, sortOrder: true },
    });
  },

  async recentPlants(limit: number): Promise<RecentPlantRow[]> {
    return prisma.plant.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: recentPlantSelect,
    });
  },
};
