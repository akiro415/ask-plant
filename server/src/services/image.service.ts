import { assertOwnerAccess, ownerScopeFilter } from '../lib/rbac';
import { imageRepository, type ImageRow } from '../repositories/image.repository';
import { plantRepository } from '../repositories/plant.repository';
import { NotFoundError } from '../middleware/errorHandler';
import type {
  ListPlantImagesQuery,
  RecentImagesQuery,
  ListImagesQuery,
  CreatePlantImageInput,
  UpdateImageInput,
} from '../schemas/image.schema';
import type { AuthenticatedUser } from '../types/express';
import type { ImageType } from '@prisma/client';

export interface ImageDto {
  id: string;
  plantId: string;
  url: string;
  imageType: string;
  caption: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  plant: {
    id: string;
    qrCode: string;
    displayName: string;
  };
}

export interface RecentImageDto {
  id: string;
  plantId: string;
  qrCode: string;
  imageUrl: string;
  imageType: string;
  createdAt: Date;
}

function plantDisplayName(row: ImageRow): string {
  return row.plant.nickname ?? row.plant.species.displayName;
}

function toImageDto(row: ImageRow): ImageDto {
  return {
    id: row.id,
    plantId: row.plantId,
    url: row.url,
    imageType: row.imageType,
    caption: row.caption,
    isPrimary: row.isPrimary,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    plant: {
      id: row.plant.id,
      qrCode: row.plant.qrCode,
      displayName: plantDisplayName(row),
    },
  };
}

function toRecentImageDto(row: ImageRow): RecentImageDto {
  return {
    id: row.id,
    plantId: row.plantId,
    qrCode: row.plant.qrCode,
    imageUrl: row.url,
    imageType: row.imageType,
    createdAt: row.createdAt,
  };
}

async function assertCanAccessPlant(plantId: string, requestUser: AuthenticatedUser): Promise<{ ownerId: string | null }> {
  const plant = await plantRepository.findById(plantId);
  if (!plant || plant.deletedAt) throw new NotFoundError('개체를 찾을 수 없습니다');
  assertOwnerAccess(plant.owner?.id, requestUser);
  return { ownerId: plant.owner?.id ?? null };
}

async function assertCanAccessImage(imageId: string, requestUser: AuthenticatedUser): Promise<ImageRow> {
  const row = await imageRepository.findById(imageId);
  if (!row || row.plant.deletedAt) throw new NotFoundError('사진을 찾을 수 없습니다');
  assertOwnerAccess(row.ownerId, requestUser);
  return row;
}

function resolveImageUrl(input: { url?: string; imageUrl?: string }): string {
  return (input.url ?? input.imageUrl ?? '').trim();
}

function ownerFilter(requestUser: AuthenticatedUser): string | undefined {
  return ownerScopeFilter(requestUser);
}

export const imageService = {
  async listByPlantId(
    plantId: string,
    query: ListPlantImagesQuery,
    requestUser: AuthenticatedUser,
  ): Promise<{ items: ImageDto[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    await assertCanAccessPlant(plantId, requestUser);

    const [rows, total] = await Promise.all([
      imageRepository.findByPlantId(plantId, { imageType: query.imageType }, { page: query.page, limit: query.limit }),
      imageRepository.countByPlantId(plantId, { imageType: query.imageType }),
    ]);

    return {
      items: rows.map(toImageDto),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async list(
    query: ListImagesQuery,
    requestUser: AuthenticatedUser,
  ): Promise<{ items: ImageDto[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const filters = {
      imageType: query.imageType,
      ownerId: ownerFilter(requestUser),
    };
    const [rows, total] = await Promise.all([
      imageRepository.findMany(filters, { page: query.page, limit: query.limit }),
      imageRepository.count(filters),
    ]);

    return {
      items: rows.map(toImageDto),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async listRecent(query: RecentImagesQuery, requestUser: AuthenticatedUser): Promise<RecentImageDto[]> {
    const rows = await imageRepository.findRecent(
      {
        imageType: query.imageType,
        ownerId: ownerFilter(requestUser),
      },
      query.limit,
    );
    return rows.map(toRecentImageDto);
  },

  async createByPlantId(
    plantId: string,
    input: CreatePlantImageInput,
    requestUser: AuthenticatedUser,
  ): Promise<ImageDto> {
    await assertCanAccessPlant(plantId, requestUser);
    const plant = await plantRepository.findById(plantId);
    const ownerId = plant?.owner?.id;
    if (!ownerId) throw new NotFoundError('개체 소유자 정보가 없습니다');

    const url = resolveImageUrl(input);
    const isPrimary = input.isPrimary ?? false;

    if (isPrimary) {
      await imageRepository.clearPrimaryForPlant(plantId);
    }

    const row = await imageRepository.create({
      plant: { connect: { id: plantId } },
      owner: { connect: { id: ownerId } },
      url,
      imageType: input.imageType as ImageType,
      caption: input.caption ?? null,
      isPrimary,
      sortOrder: input.sortOrder ?? 0,
    });
    return toImageDto(row);
  },

  async update(id: string, input: UpdateImageInput, requestUser: AuthenticatedUser): Promise<ImageDto> {
    const existing = await assertCanAccessImage(id, requestUser);

    const data: Parameters<typeof imageRepository.update>[1] = {};
    const nextUrl = input.url !== undefined || input.imageUrl !== undefined ? resolveImageUrl(input) : undefined;
    if (nextUrl !== undefined) data.url = nextUrl;
    if (input.imageType !== undefined) data.imageType = input.imageType as ImageType;
    if (input.caption !== undefined) data.caption = input.caption;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isPrimary !== undefined) {
      data.isPrimary = input.isPrimary;
      if (input.isPrimary) {
        await imageRepository.clearPrimaryForPlant(existing.plantId, id);
      }
    }

    const updated = await imageRepository.update(id, data);
    return toImageDto(updated);
  },

  /** PlantImage 모델에 soft delete 컬럼이 없어 물리 삭제한다. */
  async remove(id: string, requestUser: AuthenticatedUser): Promise<void> {
    await assertCanAccessImage(id, requestUser);
    await imageRepository.delete(id);
  },
};
