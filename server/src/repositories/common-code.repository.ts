import prisma from '../lib/prisma';
import type { Prisma } from '@prisma/client';
import type { CreateCommonCodeInput, UpdateCommonCodeInput } from '../schemas/common-code.schema';

export type CommonCodeRow = Awaited<ReturnType<typeof commonCodeRepository.findMany>>[number];

export const commonCodeRepository = {
  async findByGroupAndCode(groupCode: string, code: string) {
    return prisma.commonCode.findFirst({
      where: { groupCode, code, isActive: true },
    });
  },

  async findById(id: string) {
    return prisma.commonCode.findUnique({ where: { id } });
  },

  async findMany(groupCode?: string, includeInactive = false) {
    const where: Prisma.CommonCodeWhereInput = {
      ...(includeInactive ? {} : { isActive: true }),
      ...(groupCode ? { groupCode } : {}),
    };

    return prisma.commonCode.findMany({
      where,
      orderBy: [{ groupCode: 'asc' }, { sortOrder: 'asc' }],
    });
  },

  async create(data: CreateCommonCodeInput) {
    return prisma.commonCode.create({
      data: {
        groupCode: data.groupCode,
        code: data.code,
        name: data.name,
        description: data.description ?? undefined,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  },

  async update(id: string, data: UpdateCommonCodeInput) {
    return prisma.commonCode.update({
      where: { id },
      data: {
        groupCode: data.groupCode,
        code: data.code,
        name: data.name,
        description: data.description === undefined ? undefined : data.description,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
  },

  async deactivate(id: string) {
    return prisma.commonCode.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
