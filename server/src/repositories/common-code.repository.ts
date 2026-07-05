import prisma from '../lib/prisma';
import type { Prisma } from '@prisma/client';

export type CommonCodeRow = Awaited<ReturnType<typeof commonCodeRepository.findMany>>[number];

export const commonCodeRepository = {
  async findMany(groupCode?: string) {
    const where: Prisma.CommonCodeWhereInput = {
      isActive: true,
      ...(groupCode ? { groupCode } : {}),
    };

    return prisma.commonCode.findMany({
      where,
      orderBy: [{ groupCode: 'asc' }, { sortOrder: 'asc' }],
    });
  },
};
