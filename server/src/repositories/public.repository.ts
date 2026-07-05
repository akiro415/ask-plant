import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

const publicPlantInclude = {
  species: {
    select: { displayName: true, scientificName: true, koreanName: true, englishName: true },
  },
  location: { select: { name: true } },
  status: { select: { code: true, name: true } },
  images: { select: { url: true, imageType: true }, orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.PlantInclude;

export type PublicPlantRow = Prisma.PlantGetPayload<{ include: typeof publicPlantInclude }>;

export const publicRepository = {
  /** DISCARDED 상태 개체는 QR 조회 결과에서 완전히 숨긴다 (docs/api-specification.md 12장). */
  async findByQrCode(qrCode: string): Promise<PublicPlantRow | null> {
    return prisma.plant.findFirst({
      where: { qrCode, deletedAt: null, status: { code: { not: 'DISCARDED' } } },
      include: publicPlantInclude,
    });
  },
};
