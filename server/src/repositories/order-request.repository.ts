import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import type { CreateOrderRequestInput } from '../schemas/order-request.schema';

export const orderRequestRepository = {
  async create(input: CreateOrderRequestInput & { totalAmount: number; userId?: string }): Promise<{ id: string }> {
    const row = await prisma.orderRequest.create({
      data: {
        sessionId: input.sessionId ?? null,
        userId: input.userId ?? null,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail?.trim() ? input.customerEmail.trim() : null,
        memo: input.memo?.trim() ? input.memo.trim() : null,
        items: input.items as Prisma.InputJsonValue,
        totalAmount: input.totalAmount,
        status: 'PENDING',
      },
      select: { id: true },
    });
    return row;
  },
};
