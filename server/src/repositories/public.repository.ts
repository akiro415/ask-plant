import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

const publicPlantInclude = {
  species: {
    select: { displayName: true, scientificName: true, koreanName: true, englishName: true },
  },
  location: { select: { name: true } },
  status: { select: { code: true, name: true } },
  images: { select: { url: true, imageType: true }, orderBy: { sortOrder: 'asc' } },
  histories: {
    take: 1,
    orderBy: { performedAt: 'desc' },
    select: {
      performedAt: true,
      title: true,
      historyType: { select: { code: true, name: true } },
    },
  },
} satisfies Prisma.PlantInclude;

export type PublicPlantRow = Prisma.PlantGetPayload<{ include: typeof publicPlantInclude }>;

const publicListInclude = {
  species: {
    select: {
      displayName: true,
      category: { select: { id: true, code: true, name: true } },
    },
  },
  status: { select: { code: true, name: true } },
  images: { select: { url: true, imageType: true }, orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.PlantInclude;

export type PublicPlantListRow = Prisma.PlantGetPayload<{ include: typeof publicListInclude }>;

export interface PublicListFilters {
  categoryId?: string;
  speciesId?: string;
  statusCode: string;
  q?: string;
}

function buildPublicListWhere(filters: PublicListFilters): Prisma.PlantWhereInput {
  const where: Prisma.PlantWhereInput = {
    deletedAt: null,
    isPublic: true,
    status: { code: 'FOR_SALE' },
  };
  if (filters.speciesId) where.speciesId = filters.speciesId;
  if (filters.categoryId) where.species = { categoryId: filters.categoryId };
  if (filters.q) {
    where.OR = [
      { nickname: { contains: filters.q, mode: 'insensitive' } },
      { qrCode: { contains: filters.q, mode: 'insensitive' } },
      { species: { displayName: { contains: filters.q, mode: 'insensitive' } } },
    ];
  }
  return where;
}

export const publicRepository = {
  async findByQrCode(qrCode: string): Promise<PublicPlantRow | null> {
    return prisma.plant.findFirst({
      where: { qrCode, isPublic: true, deletedAt: null, status: { code: 'FOR_SALE' } },
      include: publicPlantInclude,
    });
  },

  async findManyPublic(
    filters: PublicListFilters,
    pagination: { page: number; limit: number },
  ): Promise<PublicPlantListRow[]> {
    return prisma.plant.findMany({
      where: buildPublicListWhere(filters),
      include: publicListInclude,
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
  },

  async countPublic(filters: PublicListFilters): Promise<number> {
    return prisma.plant.count({ where: buildPublicListWhere(filters) });
  },
};
