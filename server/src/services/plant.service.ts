import prisma from '../lib/prisma';
import { CreatePlantInput, UpdatePlantInput } from '../schemas/plant.schema';

export const plantService = {
  async findAll() {
    return prisma.plant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        wateringRecords: {
          orderBy: { wateredAt: 'desc' },
          take: 1,
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.plant.findUnique({
      where: { id },
      include: {
        wateringRecords: {
          orderBy: { wateredAt: 'desc' },
        },
      },
    });
  },

  async create(data: CreatePlantInput) {
    return prisma.plant.create({
      data: {
        ...data,
        acquiredAt: data.acquiredAt ? new Date(data.acquiredAt) : undefined,
      },
    });
  },

  async update(id: string, data: UpdatePlantInput) {
    return prisma.plant.update({
      where: { id },
      data: {
        ...data,
        acquiredAt: data.acquiredAt ? new Date(data.acquiredAt) : undefined,
      },
    });
  },

  async delete(id: string) {
    return prisma.plant.delete({ where: { id } });
  },
};
