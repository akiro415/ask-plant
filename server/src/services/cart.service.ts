import { cartRepository, type CartItemRow } from '../repositories/cart.repository';
import { plantRepository } from '../repositories/plant.repository';
import { ForbiddenError, NotFoundError, ValidationAppError } from '../middleware/errorHandler';
import type { AddCartItemInput, UpdateCartItemInput } from '../schemas/cart.schema';
import type { AuthenticatedUser } from '../types/express';

export interface CartPlantSummaryDto {
  qrCode: string;
  nickname: string | null;
  sellingPrice: number | null;
  status: { code: string; name: string };
  species: { displayName: string };
  latestImage: { url: string; imageType: string } | null;
}

export interface CartItemDto {
  id: string;
  plantId: string;
  quantity: number;
  plant: CartPlantSummaryDto;
}

export interface CartSummaryDto {
  items: CartItemDto[];
  meta: {
    itemCount: number;
    totalQuantity: number;
    totalAmount: number;
  };
}

function toDecimalNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function toCartPlantSummary(row: CartItemRow): CartPlantSummaryDto {
  const primary = row.plant.images[0] ?? null;
  return {
    qrCode: row.plant.qrCode,
    nickname: row.plant.nickname,
    sellingPrice: toDecimalNumber(row.plant.sellingPrice),
    status: { code: row.plant.status.code, name: row.plant.status.name },
    species: { displayName: row.plant.species.displayName },
    latestImage: primary ? { url: primary.url, imageType: primary.imageType } : null,
  };
}

function toCartItemDto(row: CartItemRow): CartItemDto {
  return {
    id: row.id,
    plantId: row.plant.id,
    quantity: row.quantity,
    plant: toCartPlantSummary(row),
  };
}

function buildSummary(items: CartItemDto[]): CartSummaryDto {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.plant.sellingPrice ?? 0) * item.quantity,
    0,
  );
  return {
    items,
    meta: { itemCount: items.length, totalQuantity, totalAmount },
  };
}

async function assertOwnCartItem(cartItemId: string, userId: string): Promise<CartItemRow> {
  const row = await cartRepository.findById(cartItemId);
  if (!row) throw new NotFoundError('장바구니 항목을 찾을 수 없습니다');
  if (row.userId !== userId) throw new ForbiddenError('본인 장바구니만 접근할 수 있습니다');
  return row;
}

async function resolvePlantId(input: AddCartItemInput): Promise<string> {
  if (input.plantId) return input.plantId;
  if (input.qrCode) {
    const plant = await plantRepository.findByQrCode(input.qrCode);
    if (!plant || plant.deletedAt) throw new NotFoundError('개체를 찾을 수 없습니다');
    return plant.id;
  }
  throw new ValidationAppError('plantId 또는 qrCode가 필요합니다', [
    { field: 'plantId', message: 'plantId 또는 qrCode 중 하나는 필수입니다' },
  ]);
}

async function assertPlantCanBeAdded(plantId: string): Promise<void> {
  const plant = await plantRepository.findById(plantId);
  if (!plant || plant.deletedAt) throw new NotFoundError('개체를 찾을 수 없습니다');
  if (plant.status.code === 'DISCARDED') {
    throw new ValidationAppError('장바구니에 담을 수 없는 개체입니다', [
      { field: 'plantId', message: '폐기된 개체는 장바구니에 추가할 수 없습니다' },
    ]);
  }
  if (plant.status.code !== 'FOR_SALE') {
    throw new ValidationAppError('장바구니에 담을 수 없는 개체입니다', [
      { field: 'plantId', message: '판매중(FOR_SALE) 상태의 개체만 장바구니에 추가할 수 있습니다' },
    ]);
  }
}

export const cartService = {
  async getMyCart(user: AuthenticatedUser): Promise<CartSummaryDto> {
    const rows = await cartRepository.findByUserId(user.id);
    const activeRows = rows.filter((row) => !row.plant.deletedAt);
    return buildSummary(activeRows.map(toCartItemDto));
  },

  async addItem(input: AddCartItemInput, user: AuthenticatedUser): Promise<CartSummaryDto> {
    const plantId = await resolvePlantId(input);
    await assertPlantCanBeAdded(plantId);

    const existing = await cartRepository.findByUserAndPlant(user.id, plantId);
    if (existing) {
      await cartRepository.incrementQuantity(existing.id, input.quantity);
    } else {
      await cartRepository.create(user.id, plantId, input.quantity);
    }
    return this.getMyCart(user);
  },

  async updateItem(id: string, input: UpdateCartItemInput, user: AuthenticatedUser): Promise<CartSummaryDto> {
    const row = await assertOwnCartItem(id, user.id);
    if (row.plant.deletedAt) throw new NotFoundError('개체를 찾을 수 없습니다');
    await cartRepository.updateQuantity(id, input.quantity);
    return this.getMyCart(user);
  },

  async removeItem(id: string, user: AuthenticatedUser): Promise<CartSummaryDto> {
    await assertOwnCartItem(id, user.id);
    await cartRepository.delete(id);
    return this.getMyCart(user);
  },

  async clear(user: AuthenticatedUser): Promise<CartSummaryDto> {
    await cartRepository.clearByUserId(user.id);
    return buildSummary([]);
  },
};
