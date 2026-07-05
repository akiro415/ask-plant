import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import type { CreatePlantInput, UpdatePlantInput } from '../schemas/plant.schema';

const listInclude = {
  species: {
    select: { id: true, displayName: true, scientificName: true, koreanName: true, genus: true, category: true },
  },
  location: { select: { id: true, code: true, name: true } },
  status: true,
  originType: true,
  images: { where: { isPrimary: true }, take: 1 },
} satisfies Prisma.PlantInclude;

const detailInclude = {
  ...listInclude,
  parentPlant: {
    select: { id: true, qrCode: true, species: { select: { displayName: true } } },
  },
  owner: { select: { id: true, name: true, email: true } },
  images: { orderBy: { sortOrder: 'asc' } },
  histories: {
    orderBy: { performedAt: 'desc' },
    take: 10,
    include: { historyType: true, fromLocation: true, toLocation: true, image: true },
  },
} satisfies Prisma.PlantInclude;

export type PlantListRow = Prisma.PlantGetPayload<{ include: typeof listInclude }>;
export type PlantDetailRow = Prisma.PlantGetPayload<{ include: typeof detailInclude }>;

export interface PlantFilters {
  q?: string;
  speciesId?: string;
  locationId?: string;
  statusCode?: string;
  originTypeCode?: string;
  /** CUSTOMER 역할 요청 시 본인 소유 개체만 조회하도록 강제하는 필터 (RBAC) */
  ownerId?: string;
}

export interface PlantPagination {
  page: number;
  limit: number;
  sort: 'createdAt' | 'updatedAt' | 'sellingPrice' | 'purchaseDate';
  order: 'asc' | 'desc';
}

function buildWhere(filters: PlantFilters): Prisma.PlantWhereInput {
  const where: Prisma.PlantWhereInput = { deletedAt: null };

  if (filters.speciesId) where.speciesId = filters.speciesId;
  if (filters.locationId) where.locationId = filters.locationId;
  if (filters.statusCode) where.status = { code: filters.statusCode };
  if (filters.originTypeCode) where.originType = { code: filters.originTypeCode };
  if (filters.ownerId) where.ownerId = filters.ownerId;

  if (filters.q) {
    where.OR = [
      { qrCode: { contains: filters.q, mode: 'insensitive' } },
      { nickname: { contains: filters.q, mode: 'insensitive' } },
      { species: { displayName: { contains: filters.q, mode: 'insensitive' } } },
      { species: { scientificName: { contains: filters.q, mode: 'insensitive' } } },
    ];
  }

  return where;
}

export const plantRepository = {
  async findMany(filters: PlantFilters, pagination: PlantPagination): Promise<PlantListRow[]> {
    return prisma.plant.findMany({
      where: buildWhere(filters),
      include: listInclude,
      orderBy: { [pagination.sort]: pagination.order } as Prisma.PlantOrderByWithRelationInput,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
  },

  async count(filters: PlantFilters): Promise<number> {
    return prisma.plant.count({ where: buildWhere(filters) });
  },

  async findById(id: string): Promise<PlantDetailRow | null> {
    return prisma.plant.findFirst({ where: { id, deletedAt: null }, include: detailInclude });
  },

  async findByQrCode(qrCode: string): Promise<{ id: string; deletedAt: Date | null } | null> {
    return prisma.plant.findUnique({
      where: { qrCode },
      select: { id: true, deletedAt: true },
    });
  },

  async findSpeciesCategoryPrefix(speciesId: string): Promise<string | null> {
    const species = await prisma.species.findUnique({
      where: { id: speciesId },
      select: { category: { select: { code: true } } },
    });
    if (!species) return null;
    return species.category?.code ?? 'OTH';
  },

  /** Species.category.code(prefix) 기준 QrSequence를 원자적으로 증가시켜 QR코드를 발급한다. */
  async generateQrCode(prefix: string): Promise<string> {
    const sequence = await prisma.qrSequence.upsert({
      where: { prefix },
      create: { prefix, lastNumber: 1 },
      update: { lastNumber: { increment: 1 } },
    });
    return `${prefix}-${String(sequence.lastNumber).padStart(6, '0')}`;
  },

  async create(data: CreatePlantInput & { qrCode: string; ownerId: string; isPublic?: boolean }): Promise<PlantDetailRow> {
    return prisma.plant.create({
      data: {
        qrCode: data.qrCode,
        speciesId: data.speciesId,
        statusId: data.statusId,
        originTypeId: data.originTypeId,
        ownerId: data.ownerId,
        isPublic: data.isPublic ?? false,
        nickname: data.nickname ?? undefined,
        locationId: data.locationId ?? undefined,
        parentPlantId: data.parentPlantId ?? undefined,
        purchasePrice: data.purchasePrice ?? undefined,
        sellingPrice: data.sellingPrice ?? data.totalSellingPrice ?? undefined,
        flowerColor: data.flowerColor ?? undefined,
        purchaseHeadCount: data.purchaseHeadCount ?? undefined,
        purchaseUnitPrice: data.purchaseUnitPrice ?? undefined,
        currentHeadCount: data.currentHeadCount ?? undefined,
        unitSellingPrice: data.unitSellingPrice ?? undefined,
        totalSellingPrice: data.totalSellingPrice ?? undefined,
        purchaseVendor: data.purchaseVendor ?? undefined,
        purchaseFarm: data.purchaseFarm ?? undefined,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        seedDate: data.seedDate ? new Date(data.seedDate) : undefined,
        potSize: data.potSize ?? undefined,
        memo: data.memo ?? undefined,
      } as Prisma.PlantUncheckedCreateInput,
      include: detailInclude,
    }) as Promise<PlantDetailRow>;
  },

  async update(id: string, data: UpdatePlantInput): Promise<PlantDetailRow> {
    return prisma.plant.update({
      where: { id },
      data: {
        nickname: data.nickname === undefined ? undefined : data.nickname,
        locationId: data.locationId === undefined ? undefined : data.locationId,
        statusId: data.statusId ?? undefined,
        originTypeId: data.originTypeId ?? undefined,
        parentPlantId: data.parentPlantId === undefined ? undefined : data.parentPlantId,
        ownerId: data.ownerId === undefined ? undefined : data.ownerId,
        isPublic: data.isPublic === undefined ? undefined : data.isPublic,
        purchasePrice: data.purchasePrice === undefined ? undefined : data.purchasePrice,
        sellingPrice:
          data.sellingPrice === undefined
            ? data.totalSellingPrice === undefined
              ? undefined
              : data.totalSellingPrice
            : data.sellingPrice,
        flowerColor: data.flowerColor === undefined ? undefined : data.flowerColor,
        purchaseHeadCount: data.purchaseHeadCount === undefined ? undefined : data.purchaseHeadCount,
        purchaseUnitPrice: data.purchaseUnitPrice === undefined ? undefined : data.purchaseUnitPrice,
        currentHeadCount: data.currentHeadCount === undefined ? undefined : data.currentHeadCount,
        unitSellingPrice: data.unitSellingPrice === undefined ? undefined : data.unitSellingPrice,
        totalSellingPrice: data.totalSellingPrice === undefined ? undefined : data.totalSellingPrice,
        purchaseVendor: data.purchaseVendor === undefined ? undefined : data.purchaseVendor,
        purchaseFarm: data.purchaseFarm === undefined ? undefined : data.purchaseFarm,
        purchaseDate:
          data.purchaseDate === undefined ? undefined : data.purchaseDate ? new Date(data.purchaseDate) : null,
        seedDate: data.seedDate === undefined ? undefined : data.seedDate ? new Date(data.seedDate) : null,
        potSize: data.potSize === undefined ? undefined : data.potSize,
        memo: data.memo === undefined ? undefined : data.memo,
        soldAt: data.soldAt === undefined ? undefined : data.soldAt ? new Date(data.soldAt) : null,
      } as Prisma.PlantUncheckedUpdateInput,
      include: detailInclude,
    }) as Promise<PlantDetailRow>;
  },

  /** Soft Delete — 실제 row는 삭제하지 않고 deletedAt만 기록한다 (docs/RULES.md). */
  async softDelete(id: string): Promise<void> {
    await prisma.plant.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
