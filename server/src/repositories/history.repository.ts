import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

const historyInclude = {
  historyType: true,
  performedBy: { select: { id: true, name: true } },
  fromLocation: { select: { id: true, name: true } },
  toLocation: { select: { id: true, name: true } },
  image: { select: { id: true, url: true } },
  plant: {
    select: {
      id: true,
      qrCode: true,
      nickname: true,
      ownerId: true,
      deletedAt: true,
      species: { select: { displayName: true } },
    },
  },
} satisfies Prisma.PlantHistoryInclude;

export type HistoryRow = Prisma.PlantHistoryGetPayload<{ include: typeof historyInclude }>;

export interface HistoryFilters {
  plantId?: string;
  historyTypeCode?: string;
  /** CUSTOMER 역할 요청 시 본인 소유 개체의 이력만 조회 */
  ownerId?: string;
}

function buildWhere(filters: HistoryFilters): Prisma.PlantHistoryWhereInput {
  const plantWhere: Prisma.PlantWhereInput = { deletedAt: null };
  if (filters.ownerId) plantWhere.ownerId = filters.ownerId;

  const where: Prisma.PlantHistoryWhereInput = { plant: plantWhere };
  if (filters.plantId) where.plantId = filters.plantId;
  if (filters.historyTypeCode) where.historyType = { code: filters.historyTypeCode };
  return where;
}

export const historyRepository = {
  async findByPlantId(
    plantId: string,
    pagination: { page: number; limit: number },
  ): Promise<HistoryRow[]> {
    return prisma.plantHistory.findMany({
      where: buildWhere({ plantId }),
      include: historyInclude,
      orderBy: { performedAt: 'desc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
  },

  async countByPlantId(plantId: string): Promise<number> {
    return prisma.plantHistory.count({ where: buildWhere({ plantId }) });
  },

  async findRecent(
    filters: HistoryFilters,
    limit: number,
  ): Promise<HistoryRow[]> {
    return prisma.plantHistory.findMany({
      where: buildWhere(filters),
      include: historyInclude,
      orderBy: { performedAt: 'desc' },
      take: limit,
    });
  },

  async findById(id: string): Promise<HistoryRow | null> {
    return prisma.plantHistory.findUnique({ where: { id }, include: historyInclude });
  },

  async create(data: Prisma.PlantHistoryCreateInput): Promise<HistoryRow> {
    return prisma.plantHistory.create({ data, include: historyInclude });
  },

  async update(id: string, data: Prisma.PlantHistoryUpdateInput): Promise<HistoryRow> {
    return prisma.plantHistory.update({ where: { id }, data, include: historyInclude });
  },

  async delete(id: string): Promise<void> {
    await prisma.plantHistory.delete({ where: { id } });
  },
};
