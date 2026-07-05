import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

const qrPlantInclude = {
  species: {
    select: {
      displayName: true,
      category: { select: { code: true } },
    },
  },
  status: { select: { code: true, name: true } },
} satisfies Prisma.PlantInclude;

export type QrPlantRow = Prisma.PlantGetPayload<{ include: typeof qrPlantInclude }>;

export interface QrListFilters {
  plantId?: string;
  q?: string;
  ownerId?: string;
}

function buildWhere(filters: QrListFilters): Prisma.PlantWhereInput {
  const where: Prisma.PlantWhereInput = { deletedAt: null };
  if (filters.plantId) where.id = filters.plantId;
  if (filters.ownerId) where.ownerId = filters.ownerId;
  if (filters.q) {
    where.OR = [
      { qrCode: { contains: filters.q, mode: 'insensitive' } },
      { nickname: { contains: filters.q, mode: 'insensitive' } },
      { species: { displayName: { contains: filters.q, mode: 'insensitive' } } },
    ];
  }
  return where;
}

export const qrRepository = {
  async findMany(filters: QrListFilters, limit: number): Promise<QrPlantRow[]> {
    return prisma.plant.findMany({
      where: buildWhere(filters),
      include: qrPlantInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async findById(id: string): Promise<QrPlantRow | null> {
    return prisma.plant.findFirst({
      where: { id, deletedAt: null },
      include: qrPlantInclude,
    });
  },
};
