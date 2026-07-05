import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

const cartItemInclude = {
  plant: {
    select: {
      id: true,
      qrCode: true,
      nickname: true,
      sellingPrice: true,
      deletedAt: true,
      status: { select: { code: true, name: true } },
      species: { select: { displayName: true } },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true, imageType: true },
      },
    },
  },
} satisfies Prisma.CartInclude;

export type CartItemRow = Prisma.CartGetPayload<{ include: typeof cartItemInclude }>;

export const cartRepository = {
  async findByUserId(userId: string): Promise<CartItemRow[]> {
    return prisma.cart.findMany({
      where: { userId },
      include: cartItemInclude,
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findById(id: string): Promise<CartItemRow | null> {
    return prisma.cart.findUnique({ where: { id }, include: cartItemInclude });
  },

  async findByUserAndPlant(userId: string, plantId: string): Promise<CartItemRow | null> {
    return prisma.cart.findUnique({
      where: { userId_plantId: { userId, plantId } },
      include: cartItemInclude,
    });
  },

  async create(userId: string, plantId: string, quantity: number): Promise<CartItemRow> {
    return prisma.cart.create({
      data: { userId, plantId, quantity },
      include: cartItemInclude,
    });
  },

  async updateQuantity(id: string, quantity: number): Promise<CartItemRow> {
    return prisma.cart.update({
      where: { id },
      data: { quantity },
      include: cartItemInclude,
    });
  },

  async incrementQuantity(id: string, delta: number): Promise<CartItemRow> {
    return prisma.cart.update({
      where: { id },
      data: { quantity: { increment: delta } },
      include: cartItemInclude,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.cart.delete({ where: { id } });
  },

  async clearByUserId(userId: string): Promise<number> {
    const result = await prisma.cart.deleteMany({ where: { userId } });
    return result.count;
  },
};
