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

  async countActiveCustomers(): Promise<number> {
    return prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } });
  },

  /** STAFF를 제외한 활성 사용자 수 (ADMIN + CUSTOMER) */
  async countNonStaffUsers(): Promise<number> {
    return prisma.user.count({ where: { role: { not: 'STAFF' }, isActive: true } });
  },

  async plantCountByOwner(): Promise<{ ownerId: string; count: number }[]> {
    const rows = await prisma.plant.groupBy({
      by: ['ownerId'],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    return rows.map((r) => ({ ownerId: r.ownerId, count: r._count._all }));
  },

  async salesTotalByOwner(): Promise<{ ownerId: string; total: number }[]> {
    const saleType = await prisma.commonCode.findFirst({
      where: { groupCode: 'HISTORY_TYPE', code: 'SALE' },
      select: { id: true },
    });
    if (!saleType) return [];

    const rows = await prisma.plantHistory.groupBy({
      by: ['ownerId'],
      where: { historyTypeId: saleType.id },
      _sum: { amount: true },
    });
    return rows.map((r) => ({ ownerId: r.ownerId, total: Number(r._sum.amount ?? 0) }));
  },

  async findUsersByIds(ids: string[]): Promise<
    { id: string; name: string; email: string; role: string; updatedAt: Date }[]
  > {
    if (ids.length === 0) return [];
    return prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });
  },
};
