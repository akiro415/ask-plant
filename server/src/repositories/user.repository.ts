import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

/** passwordHash는 API 응답에 절대 포함하지 않는다. */
const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export interface UserFilters {
  q?: string;
  role?: string;
  includeInactive?: boolean;
}

function buildWhere(filters: UserFilters): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (!filters.includeInactive) where.isActive = true;
  if (filters.role) where.role = filters.role as Prisma.EnumUserRoleFilter['equals'];

  if (filters.q) {
    where.OR = [
      { email: { contains: filters.q, mode: 'insensitive' } },
      { name: { contains: filters.q, mode: 'insensitive' } },
      { phone: { contains: filters.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<UserRow | null> {
    return prisma.user.findUnique({ where: { id }, select: userSelect });
  },

  async findMany(filters: UserFilters = {}): Promise<UserRow[]> {
    return prisma.user.findMany({
      where: buildWhere(filters),
      select: userSelect,
      orderBy: [{ createdAt: 'desc' }],
    });
  },

  async countActiveAdmins(excludeId?: string): Promise<number> {
    return prisma.user.count({
      where: {
        role: 'ADMIN',
        isActive: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserRow> {
    return prisma.user.update({ where: { id }, data, select: userSelect });
  },

  async softDelete(id: string): Promise<UserRow> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: userSelect,
    });
  },
};
