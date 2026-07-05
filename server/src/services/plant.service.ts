import {
  assertOwnerAccess,
  ownerScopeFilter,
  resolveCreateOwnerId,
  sanitizePlantUpdateForRole,
} from '../lib/rbac';
import { plantRepository, type PlantListRow, type PlantDetailRow } from '../repositories/plant.repository';
import { NotFoundError, ValidationAppError, ForbiddenError } from '../middleware/errorHandler';
import type { CreatePlantInput, UpdatePlantInput, ListPlantQuery } from '../schemas/plant.schema';
import type { AuthenticatedUser } from '../types/express';

function assertCanAccess(row: Pick<PlantDetailRow, 'owner'>, requestUser: AuthenticatedUser): void {
  assertOwnerAccess(row.owner?.id, requestUser);
}

export interface CommonCodeDto {
  code: string;
  name: string;
}

export interface PlantSummaryDto {
  id: string;
  qrCode: string;
  nickname: string | null;
  species: { id: string; displayName: string; scientificName: string | null; koreanName: string | null; genus: string | null };
  location: { id: string; code: string; name: string } | null;
  owner: { id: string; name: string; email: string } | null;
  status: CommonCodeDto;
  originType: CommonCodeDto;
  lifeCycleStage: string | null;
  sellingPrice: number | null;
  flowerColor: string | null;
  purchaseHeadCount: number | null;
  purchaseUnitPrice: number | null;
  currentHeadCount: number | null;
  unitSellingPrice: number | null;
  totalSellingPrice: number | null;
  purchaseVendor: string | null;
  purchaseFarm: string | null;
  primaryImageUrl: string | null;
  createdAt: Date;
}

export interface PlantDetailDto extends PlantSummaryDto {
  purchasePrice: number | null;
  purchaseDate: Date | null;
  seedDate: Date | null;
  potSize: string | null;
  memo: string | null;
  soldAt: Date | null;
  parentPlant: { id: string; qrCode: string; displayName: string } | null;
  parentPlant1: { id: string; qrCode: string; displayName: string } | null;
  parentPlant2: { id: string; qrCode: string; displayName: string } | null;
  isPublic: boolean;
  images: { id: string; url: string; imageType: string; isPrimary: boolean }[];
  recentHistories: {
    id: string;
    historyType: CommonCodeDto;
    performedAt: Date;
    title: string | null;
    description: string | null;
    amount: number | null;
  }[];
}

export interface PlantListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function toDecimalNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

/** Prisma client 재생성 전까지 commerce 필드 접근용 (schema.prisma 반영 후 prisma generate 필요) */
interface PlantCommerceFields {
  flowerColor: string | null;
  purchaseHeadCount: number | null;
  purchaseUnitPrice: unknown;
  currentHeadCount: number | null;
  unitSellingPrice: unknown;
  totalSellingPrice: unknown;
  purchaseVendor: string | null;
  purchaseFarm: string | null;
  sellingPrice: unknown;
}

function asCommerceRow(row: PlantListRow | PlantDetailRow): PlantCommerceFields {
  return row as PlantListRow & PlantCommerceFields;
}

function mapCommerceFields(row: PlantListRow | PlantDetailRow) {
  const commerce = asCommerceRow(row);
  return {
    flowerColor: commerce.flowerColor,
    purchaseHeadCount: commerce.purchaseHeadCount,
    purchaseUnitPrice: toDecimalNumber(commerce.purchaseUnitPrice),
    currentHeadCount: commerce.currentHeadCount,
    unitSellingPrice: toDecimalNumber(commerce.unitSellingPrice),
    totalSellingPrice: toDecimalNumber(commerce.totalSellingPrice ?? commerce.sellingPrice),
    purchaseVendor: commerce.purchaseVendor,
    purchaseFarm: commerce.purchaseFarm,
  };
}

function mapParent(
  row: { id: string; qrCode: string; species: { displayName: string } } | null | undefined,
): { id: string; qrCode: string; displayName: string } | null {
  if (!row) return null;
  return { id: row.id, qrCode: row.qrCode, displayName: row.species.displayName };
}

function toSummaryDto(row: PlantListRow): PlantSummaryDto {
  return {
    id: row.id,
    qrCode: row.qrCode,
    nickname: row.nickname,
    species: {
      id: row.species.id,
      displayName: row.species.displayName,
      scientificName: row.species.scientificName,
      koreanName: row.species.koreanName,
      genus: row.species.genus,
    },
    location: row.location ? { id: row.location.id, code: row.location.code, name: row.location.name } : null,
    owner: row.owner ? { id: row.owner.id, name: row.owner.name, email: row.owner.email } : null,
    status: { code: row.status.code, name: row.status.name },
    originType: { code: row.originType.code, name: row.originType.name },
    lifeCycleStage: row.lifeCycleStage,
    sellingPrice: toDecimalNumber(asCommerceRow(row).sellingPrice ?? asCommerceRow(row).totalSellingPrice),
    ...mapCommerceFields(row),
    primaryImageUrl: row.images[0]?.url ?? null,
    createdAt: row.createdAt,
  };
}

function toDetailDto(row: PlantDetailRow): PlantDetailDto {
  const primaryImage = row.images.find((image) => image.isPrimary) ?? row.images[0];

  return {
    id: row.id,
    qrCode: row.qrCode,
    nickname: row.nickname,
    species: {
      id: row.species.id,
      displayName: row.species.displayName,
      scientificName: row.species.scientificName,
      koreanName: row.species.koreanName,
      genus: row.species.genus,
    },
    location: row.location ? { id: row.location.id, code: row.location.code, name: row.location.name } : null,
    owner: row.owner ? { id: row.owner.id, name: row.owner.name, email: row.owner.email } : null,
    status: { code: row.status.code, name: row.status.name },
    originType: { code: row.originType.code, name: row.originType.name },
    lifeCycleStage: row.lifeCycleStage,
    sellingPrice: toDecimalNumber(asCommerceRow(row).sellingPrice ?? asCommerceRow(row).totalSellingPrice),
    ...mapCommerceFields(row),
    primaryImageUrl: primaryImage?.url ?? null,
    createdAt: row.createdAt,
    purchasePrice: toDecimalNumber(row.purchasePrice),
    purchaseDate: row.purchaseDate,
    seedDate: row.seedDate,
    potSize: row.potSize,
    memo: row.memo,
    soldAt: row.soldAt,
    parentPlant: mapParent(row.parentPlant),
    parentPlant1: mapParent(row.parentPlant1 ?? row.parentPlant),
    parentPlant2: mapParent(row.parentPlant2),
    isPublic: row.isPublic,
    images: row.images.map((image) => ({
      id: image.id,
      url: image.url,
      imageType: image.imageType,
      isPrimary: image.isPrimary,
    })),
    recentHistories: row.histories.map((history) => ({
      id: history.id,
      historyType: { code: history.historyType.code, name: history.historyType.name },
      performedAt: history.performedAt,
      title: history.title,
      description: history.description,
      amount: toDecimalNumber(history.amount),
    })),
  };
}

export const plantService = {
  async list(query: ListPlantQuery, requestUser: AuthenticatedUser): Promise<{ items: PlantSummaryDto[]; meta: PlantListMeta }> {
    const scopedOwnerId = ownerScopeFilter(requestUser);
    const filters = {
      q: query.q,
      speciesId: query.speciesId,
      locationId: query.locationId,
      statusCode: query.status,
      originTypeCode: query.originType,
      ownerId: scopedOwnerId ?? query.ownerId,
      ownerQ: scopedOwnerId ? undefined : query.ownerQ,
    };
    const pagination = { page: query.page, limit: query.limit, sort: query.sort, order: query.order };

    const [rows, total] = await Promise.all([
      plantRepository.findMany(filters, pagination),
      plantRepository.count(filters),
    ]);

    return {
      items: rows.map(toSummaryDto),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async getById(id: string, requestUser: AuthenticatedUser): Promise<PlantDetailDto> {
    const row = await plantRepository.findById(id);
    if (!row) {
      throw new NotFoundError('개체를 찾을 수 없습니다');
    }
    assertCanAccess(row, requestUser);
    return toDetailDto(row);
  },

  async create(input: CreatePlantInput, requestUser: AuthenticatedUser): Promise<PlantDetailDto> {
    const prefix = await plantRepository.findSpeciesCategoryPrefix(input.speciesId);
    if (prefix === null) {
      throw new ValidationAppError('존재하지 않는 speciesId입니다', [{ field: 'speciesId', message: '유효하지 않은 품종입니다' }]);
    }

    const qrCode = await plantRepository.generateQrCode(prefix);
    const ownerId = resolveCreateOwnerId(input.ownerId ?? undefined, requestUser);
    const created = await plantRepository.create({
      ...input,
      qrCode,
      ownerId,
      isPublic: input.isPublic ?? false,
    });
    return toDetailDto(created);
  },

  async update(id: string, input: UpdatePlantInput, requestUser: AuthenticatedUser): Promise<PlantDetailDto> {
    const existing = await plantRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('개체를 찾을 수 없습니다');
    }
    assertCanAccess(existing, requestUser);

    const sanitized = sanitizePlantUpdateForRole(input, requestUser);
    const updated = await plantRepository.update(id, sanitized);
    return toDetailDto(updated);
  },

  async remove(id: string, requestUser: AuthenticatedUser): Promise<void> {
    const existing = await plantRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('개체를 찾을 수 없습니다');
    }
    assertCanAccess(existing, requestUser);

    await plantRepository.softDelete(id);
  },
};
