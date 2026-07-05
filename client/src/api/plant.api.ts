import { httpClient } from './http';
import type { CommonCode } from '@/types/common';
import type { PlantDetail, PlantSummary } from '@/types/plant';
import type { PlantImage } from '@/types/image';
import type { PlantHistory } from '@/types/history';

// ── 서버 응답(DTO) 타입 — server/src/services/plant.service.ts 의 PlantSummaryDto/PlantDetailDto와 대응 ──
interface ApiCommonCodeRef {
  code: string;
  name: string;
}

interface ApiPlantSpeciesRef {
  id: string;
  displayName: string;
  scientificName: string | null;
  koreanName: string | null;
  genus: string | null;
}

interface ApiPlantSummary {
  id: string;
  qrCode: string;
  nickname: string | null;
  species: ApiPlantSpeciesRef;
  location: { id: string; code: string; name: string } | null;
  status: ApiCommonCodeRef;
  originType: ApiCommonCodeRef;
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
  createdAt: string;
}

interface ApiPlantDetail extends ApiPlantSummary {
  purchasePrice: number | null;
  purchaseDate: string | null;
  seedDate: string | null;
  potSize: string | null;
  memo: string | null;
  parentPlant: { id: string; qrCode: string; displayName: string } | null;
  owner: { id: string; name: string; email: string } | null;
  isPublic: boolean;
  images: { id: string; url: string; imageType: string; isPrimary: boolean }[];
  recentHistories: {
    id: string;
    historyType: ApiCommonCodeRef;
    performedAt: string;
    title: string | null;
    description: string | null;
    amount: number | null;
  }[];
}

interface ApiListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiListResponse<T> {
  data: T[];
  meta: ApiListMeta;
}

interface ApiItemResponse<T> {
  data: T;
}

export interface ListPlantsParams {
  q?: string;
  status?: string;
  originType?: string;
  speciesId?: string;
  locationId?: string;
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'updatedAt' | 'sellingPrice' | 'purchaseDate';
  order?: 'asc' | 'desc';
}

export interface CreatePlantPayload {
  speciesId: string;
  statusId: string;
  originTypeId: string;
  nickname?: string | null;
  locationId?: string | null;
  purchasePrice?: number | null;
  sellingPrice?: number | null;
  flowerColor?: string | null;
  purchaseHeadCount?: number | null;
  purchaseUnitPrice?: number | null;
  currentHeadCount?: number | null;
  unitSellingPrice?: number | null;
  totalSellingPrice?: number | null;
  purchaseVendor?: string | null;
  purchaseFarm?: string | null;
  ownerId?: string | null;
  isPublic?: boolean;
  purchaseDate?: string | null;
  seedDate?: string | null;
  potSize?: string | null;
  memo?: string | null;
}

/** PUT /plants/:id — speciesId/qrCode 변경 불가 */
export type UpdatePlantPayload = Omit<CreatePlantPayload, 'speciesId'>;

// ── DTO → 앱 타입(client/src/types/plant.ts) 매핑 ──
// 현재 API는 species.category, childPlantCount, 이력의 담당자/위치/사진 등 일부 필드를 내려주지 않는다.
// 해당 필드는 화면이 깨지지 않도록 안전한 기본값(null/0/[])으로 채운다.
function toCommonCode(ref: ApiCommonCodeRef, groupCode: string): CommonCode {
  return { id: '', groupCode, code: ref.code, name: ref.name, sortOrder: 0 };
}

function toSummary(dto: ApiPlantSummary): PlantSummary {
  return {
    id: dto.id,
    qrCode: dto.qrCode,
    nickname: dto.nickname,
    species: {
      id: dto.species.id,
      displayName: dto.species.displayName,
      scientificName: dto.species.scientificName,
      koreanName: dto.species.koreanName,
      category: null,
    },
    location: dto.location ? { id: dto.location.id, name: dto.location.name } : null,
    status: toCommonCode(dto.status, 'PLANT_STATUS'),
    originType: toCommonCode(dto.originType, 'ORIGIN_TYPE'),
    sellingPrice: dto.sellingPrice,
    flowerColor: dto.flowerColor,
    purchaseHeadCount: dto.purchaseHeadCount,
    purchaseUnitPrice: dto.purchaseUnitPrice,
    currentHeadCount: dto.currentHeadCount,
    unitSellingPrice: dto.unitSellingPrice,
    totalSellingPrice: dto.totalSellingPrice,
    purchaseVendor: dto.purchaseVendor,
    purchaseFarm: dto.purchaseFarm,
    primaryImageUrl: dto.primaryImageUrl ?? '',
    createdAt: dto.createdAt,
  };
}

function toImage(image: ApiPlantDetail['images'][number], plantId: string, index: number): PlantImage {
  return {
    id: image.id,
    plantId,
    url: image.url,
    imageType: image.imageType as PlantImage['imageType'],
    caption: null,
    isPrimary: image.isPrimary,
    sortOrder: index,
    createdAt: '',
  };
}

function toHistory(history: ApiPlantDetail['recentHistories'][number], plantId: string): PlantHistory {
  return {
    id: history.id,
    plantId,
    historyType: toCommonCode(history.historyType, 'HISTORY_TYPE'),
    performedAt: history.performedAt,
    performedBy: null,
    title: history.title,
    description: history.description,
    amount: history.amount,
    fromLocation: null,
    toLocation: null,
    image: null,
    metadata: null,
  };
}

function toDetail(dto: ApiPlantDetail): PlantDetail {
  return {
    ...toSummary(dto),
    purchasePrice: dto.purchasePrice,
    purchaseDate: dto.purchaseDate,
    seedDate: dto.seedDate,
    potSize: dto.potSize,
    memo: dto.memo,
    parentPlant: dto.parentPlant,
    owner: dto.owner,
    isPublic: dto.isPublic,
    // 자식 개체 목록/개수를 내려주는 API가 아직 없어 0으로 고정한다.
    childPlantCount: 0,
    images: dto.images.map((image, index) => toImage(image, dto.id, index)),
    histories: dto.recentHistories.map((history) => toHistory(history, dto.id)),
  };
}

export const plantApi = {
  async list(params: ListPlantsParams = {}): Promise<{ items: PlantSummary[]; meta: ApiListMeta }> {
    const { data } = await httpClient.get<ApiListResponse<ApiPlantSummary>>('/plants', { params });
    return { items: data.data.map(toSummary), meta: data.meta };
  },

  async getById(id: string): Promise<PlantDetail> {
    const { data } = await httpClient.get<ApiItemResponse<ApiPlantDetail>>(`/plants/${id}`);
    return toDetail(data.data);
  },

  async create(payload: CreatePlantPayload): Promise<PlantDetail> {
    const { data } = await httpClient.post<ApiItemResponse<ApiPlantDetail>>('/plants', payload);
    return toDetail(data.data);
  },

  async update(id: string, payload: UpdatePlantPayload): Promise<PlantDetail> {
    const { data } = await httpClient.put<ApiItemResponse<ApiPlantDetail>>(`/plants/${id}`, payload);
    return toDetail(data.data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/plants/${id}`);
  },
};
