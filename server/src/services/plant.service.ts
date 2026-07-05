import { plantRepository, type PlantListRow, type PlantDetailRow } from '../repositories/plant.repository';
import { NotFoundError, ValidationAppError, ForbiddenError } from '../middleware/errorHandler';
import type { CreatePlantInput, UpdatePlantInput, ListPlantQuery } from '../schemas/plant.schema';
import type { AuthenticatedUser } from '../types/express';

/** CUSTOMER는 본인 소유 개체만 접근 가능, ADMIN/STAFF는 전체 접근 가능 (RBAC) */
function assertCanAccess(row: Pick<PlantDetailRow, 'owner'>, requestUser: AuthenticatedUser): void {
  if (requestUser.role === 'CUSTOMER' && row.owner?.id !== requestUser.id) {
    throw new ForbiddenError('본인 소유의 개체만 접근할 수 있습니다');
  }
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
  status: CommonCodeDto;
  originType: CommonCodeDto;
  sellingPrice: number | null;
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
  owner: { id: string; name: string; email: string } | null;
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
    status: { code: row.status.code, name: row.status.name },
    originType: { code: row.originType.code, name: row.originType.name },
    sellingPrice: toDecimalNumber(row.sellingPrice),
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
    status: { code: row.status.code, name: row.status.name },
    originType: { code: row.originType.code, name: row.originType.name },
    sellingPrice: toDecimalNumber(row.sellingPrice),
    primaryImageUrl: primaryImage?.url ?? null,
    createdAt: row.createdAt,
    purchasePrice: toDecimalNumber(row.purchasePrice),
    purchaseDate: row.purchaseDate,
    seedDate: row.seedDate,
    potSize: row.potSize,
    memo: row.memo,
    soldAt: row.soldAt,
    parentPlant: row.parentPlant
      ? { id: row.parentPlant.id, qrCode: row.parentPlant.qrCode, displayName: row.parentPlant.species.displayName }
      : null,
    owner: row.owner ? { id: row.owner.id, name: row.owner.name, email: row.owner.email } : null,
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
    const filters = {
      q: query.q,
      speciesId: query.speciesId,
      locationId: query.locationId,
      statusCode: query.status,
      originTypeCode: query.originType,
      // CUSTOMER는 쿼리로 우회할 수 없도록 서버에서 강제로 본인 소유만 필터링한다.
      ownerId: requestUser.role === 'CUSTOMER' ? requestUser.id : undefined,
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
    // ownerId는 클라이언트가 보낸 값을 무시하고 항상 요청자 본인으로 설정한다.
    const created = await plantRepository.create({ ...input, qrCode, ownerId: requestUser.id });
    return toDetailDto(created);
  },

  async update(id: string, input: UpdatePlantInput, requestUser: AuthenticatedUser): Promise<PlantDetailDto> {
    const existing = await plantRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('개체를 찾을 수 없습니다');
    }
    assertCanAccess(existing, requestUser);

    const updated = await plantRepository.update(id, input);
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
