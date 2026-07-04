export type ImageType = 'PRIMARY' | 'FLOWER' | 'SALE' | 'OTHER';

export const IMAGE_TYPE_LABEL: Record<ImageType, string> = {
  PRIMARY: '대표사진',
  FLOWER: '꽃사진',
  SALE: '판매사진',
  OTHER: '기타',
};

export interface PlantImage {
  id: string;
  plantId: string;
  url: string;
  imageType: ImageType;
  caption: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}
