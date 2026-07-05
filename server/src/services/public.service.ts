import { publicRepository, type PublicPlantRow } from '../repositories/public.repository';
import { NotFoundError } from '../middleware/errorHandler';

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
}

function toPublicDto(row: PublicPlantRow): PublicPlantDto {
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
  };
}

export const publicService = {
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
