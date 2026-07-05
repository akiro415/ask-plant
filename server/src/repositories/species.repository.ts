import prisma from '../lib/prisma';

export type SpeciesSelectRow = Awaited<ReturnType<typeof speciesRepository.findManyForSelect>>[number];

export const speciesRepository = {
  /** Plant 등록 폼 등 select 옵션 용도의 최소 필드 조회 (카테고리 포함) */
  async findManyForSelect() {
    return prisma.species.findMany({
      where: { isActive: true },
      select: {
        id: true,
        displayName: true,
        scientificName: true,
        koreanName: true,
        category: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { displayName: 'asc' },
    });
  },
};
