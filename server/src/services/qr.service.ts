import { qrRepository, type QrPlantRow } from '../repositories/qr.repository';
import { ForbiddenError, NotFoundError } from '../middleware/errorHandler';
import type { ListQrQuery } from '../schemas/qr.schema';
import type { AuthenticatedUser } from '../types/express';

export interface QrListItemDto {
  plantId: string;
  qrCode: string;
  nickname: string | null;
  speciesDisplayName: string;
  categoryCode: string;
  status: { code: string; name: string };
  publicPath: string;
  issuedAt: Date;
}

export interface QrPreviewDto {
  plantId: string;
  qrCode: string;
  categoryCode: string;
  sequenceNumber: string;
  nickname: string | null;
  speciesDisplayName: string;
  status: { code: string; name: string };
  publicPath: string;
}

function ownerFilter(requestUser: AuthenticatedUser): string | undefined {
  return requestUser.role === 'CUSTOMER' ? requestUser.id : undefined;
}

function parseSequenceNumber(qrCode: string, categoryCode: string): string {
  const prefix = `${categoryCode}-`;
  if (qrCode.startsWith(prefix)) return qrCode.slice(prefix.length);
  const parts = qrCode.split('-');
  return parts[parts.length - 1] ?? qrCode;
}

function toListItem(row: QrPlantRow): QrListItemDto {
  const categoryCode = row.species.category?.code ?? 'OTH';
  return {
    plantId: row.id,
    qrCode: row.qrCode,
    nickname: row.nickname,
    speciesDisplayName: row.species.displayName,
    categoryCode,
    status: { code: row.status.code, name: row.status.name },
    publicPath: `/p/${row.qrCode}`,
    issuedAt: row.createdAt,
  };
}

function toPreview(row: QrPlantRow): QrPreviewDto {
  const categoryCode = row.species.category?.code ?? 'OTH';
  return {
    plantId: row.id,
    qrCode: row.qrCode,
    categoryCode,
    sequenceNumber: parseSequenceNumber(row.qrCode, categoryCode),
    nickname: row.nickname,
    speciesDisplayName: row.species.displayName,
    status: { code: row.status.code, name: row.status.name },
    publicPath: `/p/${row.qrCode}`,
  };
}

async function assertCanAccessPlant(plantId: string, requestUser: AuthenticatedUser): Promise<QrPlantRow> {
  const row = await qrRepository.findById(plantId);
  if (!row) throw new NotFoundError('개체를 찾을 수 없습니다');
  if (requestUser.role === 'CUSTOMER' && row.ownerId !== requestUser.id) {
    throw new ForbiddenError('본인 소유의 개체만 접근할 수 있습니다');
  }
  return row;
}

export const qrService = {
  async list(query: ListQrQuery, requestUser: AuthenticatedUser): Promise<QrListItemDto[]> {
    const rows = await qrRepository.findMany(
      {
        plantId: query.plantId,
        q: query.q,
        ownerId: ownerFilter(requestUser),
      },
      query.limit,
    );
    return rows.map(toListItem);
  },

  async preview(plantId: string, requestUser: AuthenticatedUser): Promise<QrPreviewDto> {
    const row = await assertCanAccessPlant(plantId, requestUser);
    return toPreview(row);
  },
};
