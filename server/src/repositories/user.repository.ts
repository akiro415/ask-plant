import prisma from '../lib/prisma';
import type { Prisma } from '@prisma/client';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },
};
