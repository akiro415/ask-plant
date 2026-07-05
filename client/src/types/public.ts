/** GET /public/plants/:qrCode 응답 */
export interface PublicPlant {  qrCode: string;
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
    performedAt: string;
    title: string | null;
    historyType: { code: string; name: string };
  } | null;
}

/** GET /public/plants 목록 항목 */
export interface PublicPlantListItem {
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

export interface PublicPlantListParams {
  categoryId?: string;
  speciesId?: string;
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

/** @deprecated API cart 사용 — qrCode 기반 레거시 타입 */
export interface PublicCartPlant {
  qrCode: string;
  nickname: string | null;
  displayName: string;
  sellingPrice: number | null;
  primaryImageUrl: string;
  statusCode: string;
}
