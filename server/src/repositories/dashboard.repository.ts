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

const recentUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type RecentUserRow = Prisma.UserGetPayload<{ select: typeof recentUserSelect }>;

export const dashboardRepository = {
  async countPlants(ownerId?: string): Promise<number> {
    return prisma.plant.count({ where: { deletedAt: null, ...(ownerId ? { ownerId } : {}) } });
  },

  async countSpecies(): Promise<number> {
    return prisma.species.count({ where: { isActive: true } });
  },

  async countLocations(ownerId?: string): Promise<number> {
    return prisma.plantLocation.count({
      where: { isActive: true, ...(ownerId ? { ownerId } : {}) },
    });
  },

  async countUsers(): Promise<number> {
    return prisma.user.count({ where: { isActive: true } });
  },

  async countPlantsByStatusCode(code: string, ownerId?: string): Promise<number> {
    return prisma.plant.count({
      where: {
        deletedAt: null,
        status: { code },
        ...(ownerId ? { ownerId } : {}),
      },
    });
  },

  async statusDistribution(ownerId?: string): Promise<StatusGroupRow[]> {
    const rows = await prisma.plant.groupBy({
      by: ['statusId'],
      where: { deletedAt: null, ...(ownerId ? { ownerId } : {}) },
      _count: { _all: true },
      orderBy: { _count: { statusId: 'desc' } },
    });
    return rows.map((row) => ({ statusId: row.statusId, count: row._count._all }));
  },

  async findCommonCodesByIds(ids: string[]): Promise<{ id: string; code: string; name: string; sortOrder: number }[]> {
    if (ids.length === 0) return [];
    return prisma.commonCode.findMany({
      where: { id: { in: ids } },
      select: { id: true, code: true, name: true, sortOrder: true },
    });
  },

  async recentPlants(limit: number, ownerId?: string): Promise<RecentPlantRow[]> {
    return prisma.plant.findMany({
      where: { deletedAt: null, ...(ownerId ? { ownerId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: recentPlantSelect,
    });
  },

  async recentUsers(limit: number): Promise<RecentUserRow[]> {
    return prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: recentUserSelect,
    });
  },

  async countActiveCustomers(): Promise<number> {
    return prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } });
  },

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
