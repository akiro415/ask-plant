import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

const imageInclude = {
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
} satisfies Prisma.PlantImageInclude;

export type ImageRow = Prisma.PlantImageGetPayload<{ include: typeof imageInclude }>;

export interface ImageFilters {
  plantId?: string;
  imageType?: string;
  ownerId?: string;
}

function buildWhere(filters: ImageFilters): Prisma.PlantImageWhereInput {
  const plantWhere: Prisma.PlantWhereInput = { deletedAt: null };
  if (filters.ownerId) plantWhere.ownerId = filters.ownerId;

  const where: Prisma.PlantImageWhereInput = { plant: plantWhere };
  if (filters.plantId) where.plantId = filters.plantId;
  if (filters.imageType) where.imageType = filters.imageType as Prisma.EnumImageTypeFilter['equals'];
  return where;
}

export const imageRepository = {
  async findByPlantId(
    plantId: string,
    filters: Pick<ImageFilters, 'imageType'>,
    pagination: { page: number; limit: number },
  ): Promise<ImageRow[]> {
    return prisma.plantImage.findMany({
      where: buildWhere({ plantId, imageType: filters.imageType }),
      include: imageInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
  },

  async countByPlantId(plantId: string, filters: Pick<ImageFilters, 'imageType'>): Promise<number> {
    return prisma.plantImage.count({ where: buildWhere({ plantId, imageType: filters.imageType }) });
  },

  async findMany(
    filters: ImageFilters,
    pagination: { page: number; limit: number },
  ): Promise<ImageRow[]> {
    return prisma.plantImage.findMany({
      where: buildWhere(filters),
      include: imageInclude,
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
  },

  async count(filters: ImageFilters): Promise<number> {
    return prisma.plantImage.count({ where: buildWhere(filters) });
  },

  async findRecent(filters: ImageFilters, limit: number): Promise<ImageRow[]> {
    return prisma.plantImage.findMany({
      where: buildWhere(filters),
      include: imageInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async findById(id: string): Promise<ImageRow | null> {
    return prisma.plantImage.findUnique({ where: { id }, include: imageInclude });
  },

  async create(data: Prisma.PlantImageCreateInput): Promise<ImageRow> {
    return prisma.plantImage.create({ data, include: imageInclude });
  },

  async update(id: string, data: Prisma.PlantImageUpdateInput): Promise<ImageRow> {
    return prisma.plantImage.update({ where: { id }, data, include: imageInclude });
  },

  async delete(id: string): Promise<void> {
    await prisma.plantImage.delete({ where: { id } });
  },

  async clearPrimaryForPlant(plantId: string, excludeId?: string): Promise<void> {
    await prisma.plantImage.updateMany({
      where: {
        plantId,
        isPrimary: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      data: { isPrimary: false },
    });
  },
};
