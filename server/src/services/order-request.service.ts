import prisma from '../lib/prisma';
import { ValidationAppError, NotFoundError } from '../middleware/errorHandler';
import { orderRequestRepository } from '../repositories/order-request.repository';
import type { CreateOrderRequestInput } from '../schemas/order-request.schema';

export interface OrderRequestResultDto {
  orderRequestId: string;
  totalAmount: number;
  bankAccountInfo: string | null;
  bankAccountHolder: string | null;
  message: string;
}

export const orderRequestService = {
  async create(input: CreateOrderRequestInput): Promise<OrderRequestResultDto> {
    const qrCodes = [...new Set(input.items.map((i) => i.qrCode))];
    const plants = await prisma.plant.findMany({
      where: {
        qrCode: { in: qrCodes },
        deletedAt: null,
        isPublic: true,
        status: { code: 'FOR_SALE' },
      },
      select: { id: true, qrCode: true, sellingPrice: true, totalSellingPrice: true, unitSellingPrice: true },
    });
    const plantByQr = new Map(plants.map((p) => [p.qrCode, p]));

    let totalAmount = 0;
    const resolvedItems: { plantId: string; qrCode: string; quantity: number; priceSnapshot: number }[] = [];
    for (const item of input.items) {
      const plant = plantByQr.get(item.qrCode);
      if (!plant) {
        throw new ValidationAppError('장바구니 항목이 유효하지 않습니다', [
          { field: 'items', message: `QR ${item.qrCode}는 공개 판매 중이 아닙니다` },
        ]);
      }
      totalAmount += item.priceSnapshot * item.quantity;
      resolvedItems.push({ plantId: plant.id, qrCode: item.qrCode, quantity: item.quantity, priceSnapshot: item.priceSnapshot });
    }

    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
    if (!settings) throw new NotFoundError('시스템 설정을 찾을 수 없습니다');

    const created = await orderRequestRepository.create({
      ...input,
      items: resolvedItems,
      totalAmount,
    });

    return {
      orderRequestId: created.id,
      totalAmount,
      bankAccountInfo: settings.bankAccountInfo,
      bankAccountHolder: settings.bankAccountHolder,
      message: '구매 요청이 접수되었습니다. 입금 확인 후 관리자가 연락드립니다.',
    };
  },
};
