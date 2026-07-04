import prisma from '../lib/prisma';
import { CreateWateringInput } from '../schemas/plant.schema';
import { AppError } from '../middleware/errorHandler';

export const wateringService = {
  async findByPlantId(plantId: string) {
    return prisma.wateringRecord.findMany({
      where: { plantId },
      orderBy: { wateredAt: 'desc' },
    });
  },

  async create(data: CreateWateringInput) {
    const plant = await prisma.plant.findUnique({ where: { id: data.plantId } });
    if (!plant) {
      throw new AppError(404, '식물을 찾을 수 없습니다');
    }

    const wateredAt = data.wateredAt ? new Date(data.wateredAt) : new Date();

    const [record] = await prisma.$transaction([
      prisma.wateringRecord.create({
        data: {
          plantId: data.plantId,
          wateredAt,
          notes: data.notes,
        },
      }),
      prisma.plant.update({
        where: { id: data.plantId },
        data: { lastWateredAt: wateredAt },
      }),
    ]);

    return record;
  },
};
