import { publicRepository, type PublicPlantListRow, type PublicPlantRow } from '../repositories/public.repository';
import { NotFoundError } from '../middleware/errorHandler';
import type { ListPublicPlantsQuery } from '../schemas/public.schema';

export interface PublicPlantDto {
  qrCode: string;
  nickname: string | null;
  species: {
    displayName: string;
    scientificName: string | null;
    koreanName: string | null;
    englishName: string | null;
  };
  sellingPrice: number | null;
  status: { code: string; name: string };
  location: { name: string } | null;
  images: { url: string; imageType: string }[];
  latestImage: { url: string; imageType: string } | null;
  latestHistory: {
    performedAt: Date;
    title: string | null;
    historyType: { code: string; name: string };
  } | null;
}

export interface PublicPlantListItemDto {
  qrCode: string;
  nickname: string | null;
  sellingPrice: number | null;
  status: { code: string; name: string };
  species: {
    displayName: string;
    category: { id: string; code: string; name: string } | null;
  };
  latestImage: { url: string; imageType: string } | null;
}

function pickLatestImageFromList(images: PublicPlantListRow['images']): { url: string; imageType: string } | null {
  if (images.length === 0) return null;
  const primary = images.find((img) => img.imageType === 'PRIMARY');
  return primary ?? images[0] ?? null;
}

function toPublicListItemDto(row: PublicPlantListRow): PublicPlantListItemDto {
  return {
    qrCode: row.qrCode,
    nickname: row.nickname,
    sellingPrice: row.sellingPrice === null ? null : Number(row.sellingPrice),
    status: { code: row.status.code, name: row.status.name },
    species: {
      displayName: row.species.displayName,
      category: row.species.category
        ? { id: row.species.category.id, code: row.species.category.code, name: row.species.category.name }
        : null,
    },
    latestImage: pickLatestImageFromList(row.images),
  };
}

function pickLatestImage(images: PublicPlantRow['images']): { url: string; imageType: string } | null {
  if (images.length === 0) return null;
  const primary = images.find((img) => img.imageType === 'PRIMARY');
  return primary ?? images[0] ?? null;
}

function toPublicDto(row: PublicPlantRow): PublicPlantDto {
  const latestHistoryRow = row.histories[0] ?? null;
  return {
    qrCode: row.qrCode,
    nickname: row.nickname,
    species: {
      displayName: row.species.displayName,
      scientificName: row.species.scientificName,
      koreanName: row.species.koreanName,
      englishName: row.species.englishName,
    },
    sellingPrice: row.sellingPrice === null ? null : Number(row.sellingPrice),
    status: { code: row.status.code, name: row.status.name },
    location: row.location ? { name: row.location.name } : null,
    images: row.images.map((image) => ({ url: image.url, imageType: image.imageType })),
    latestImage: pickLatestImage(row.images),
    latestHistory: latestHistoryRow
      ? {
          performedAt: latestHistoryRow.performedAt,
          title: latestHistoryRow.title,
          historyType: {
            code: latestHistoryRow.historyType.code,
            name: latestHistoryRow.historyType.name,
          },
        }
      : null,
  };
}

export const publicService = {
  async list(query: ListPublicPlantsQuery): Promise<{
    items: PublicPlantListItemDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const statusCode = query.status ?? 'FOR_SALE';
    const filters = {
      categoryId: query.categoryId,
      speciesId: query.speciesId,
      statusCode: statusCode === 'DISCARDED' ? 'FOR_SALE' : statusCode,
      q: query.q,
    };

    const [rows, total] = await Promise.all([
      publicRepository.findManyPublic(filters, { page: query.page, limit: query.limit }),
      publicRepository.countPublic(filters),
    ]);

    return {
      items: rows.map(toPublicListItemDto),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  /**
   * QR 스캔 공개 조회 — 관리자 전용 필드(purchasePrice/memo/owner/parentPlant/이력/정확한 위치)는
   * 애초에 조회(select)하지 않으므로 DTO에 포함될 수 없다.
   * 존재하지 않거나 DISCARDED 상태면 내부 상태 노출 방지를 위해 동일하게 404를 반환한다.
   */
  async getByQrCode(qrCode: string): Promise<PublicPlantDto> {
    const row = await publicRepository.findByQrCode(qrCode);
    if (!row) {
      throw new NotFoundError('존재하지 않는 QR 코드입니다');
    }
    return toPublicDto(row);
  },
};
