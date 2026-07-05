import { assertOwnerAccess, ownerScopeFilter } from '../lib/rbac';
import { historyRepository, type HistoryRow } from '../repositories/history.repository';
import { plantRepository } from '../repositories/plant.repository';
import { commonCodeRepository } from '../repositories/common-code.repository';
import { NotFoundError, ValidationAppError } from '../middleware/errorHandler';
import type {
  ListPlantHistoriesQuery,
  RecentHistoriesQuery,
  CreatePlantHistoryInput,
  UpdateHistoryInput,
} from '../schemas/history.schema';
import type { AuthenticatedUser } from '../types/express';

export interface CommonCodeRefDto {
  id: string;
  code: string;
  name: string;
}

export interface HistoryDto {
  id: string;
  plantId: string;
  historyType: CommonCodeRefDto;
  performedAt: Date;
  performedBy: { id: string; name: string } | null;
  title: string | null;
  description: string | null;
  amount: number | null;
  fromLocation: { id: string; name: string } | null;
  toLocation: { id: string; name: string } | null;
  image: { id: string; url: string } | null;
  metadata: Record<string, unknown> | null;
}

export interface RecentHistoryDto {
  id: string;
  plantId: string;
  qrCode: string;
  plantName: string;
  historyType: { code: string; name: string };
  performedAt: Date;
  amount: number | null;
  title: string | null;
}

function toDecimalNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function plantDisplayName(row: HistoryRow): string {
  return row.plant.nickname ?? row.plant.species.displayName;
}

function toHistoryDto(row: HistoryRow): HistoryDto {
  return {
    id: row.id,
    plantId: row.plantId,
    historyType: { id: row.historyType.id, code: row.historyType.code, name: row.historyType.name },
    performedAt: row.performedAt,
    performedBy: row.performedBy ? { id: row.performedBy.id, name: row.performedBy.name } : null,
    title: row.title,
    description: row.description,
    amount: toDecimalNumber(row.amount),
    fromLocation: row.fromLocation ? { id: row.fromLocation.id, name: row.fromLocation.name } : null,
    toLocation: row.toLocation ? { id: row.toLocation.id, name: row.toLocation.name } : null,
    image: row.image ? { id: row.image.id, url: row.image.url } : null,
    metadata: row.metadata as Record<string, unknown> | null,
  };
}

function toRecentHistoryDto(row: HistoryRow): RecentHistoryDto {
  return {
    id: row.id,
    plantId: row.plantId,
    qrCode: row.plant.qrCode,
    plantName: plantDisplayName(row),
    historyType: { code: row.historyType.code, name: row.historyType.name },
    performedAt: row.performedAt,
    amount: toDecimalNumber(row.amount),
    title: row.title,
  };
}

async function assertCanAccessPlant(plantId: string, requestUser: AuthenticatedUser): Promise<string> {
  const plant = await plantRepository.findById(plantId);
  if (!plant || plant.deletedAt) throw new NotFoundError('개체를 찾을 수 없습니다');
  const ownerId = plant.owner?.id;
  assertOwnerAccess(ownerId, requestUser);
  if (!ownerId) throw new NotFoundError('개체 소유자 정보가 없습니다');
  return ownerId;
}

async function assertCanAccessHistory(historyId: string, requestUser: AuthenticatedUser): Promise<HistoryRow> {
  const row = await historyRepository.findById(historyId);
  if (!row || row.plant.deletedAt) throw new NotFoundError('이력을 찾을 수 없습니다');
  assertOwnerAccess(row.ownerId, requestUser);
  return row;
}

async function resolveHistoryTypeId(typeCode: string): Promise<string> {
  const code = await commonCodeRepository.findByGroupAndCode('HISTORY_TYPE', typeCode);
  if (!code) {
    throw new ValidationAppError('유효하지 않은 이력 유형입니다', [
      { field: 'type', message: `HISTORY_TYPE code '${typeCode}'를 찾을 수 없습니다` },
    ]);
  }
  return code.id;
}

function ownerFilter(requestUser: AuthenticatedUser): string | undefined {
  return ownerScopeFilter(requestUser);
}

export const historyService = {
  async listByPlantId(
    plantId: string,
    query: ListPlantHistoriesQuery,
    requestUser: AuthenticatedUser,
  ): Promise<{ items: HistoryDto[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    await assertCanAccessPlant(plantId, requestUser);

    const [rows, total] = await Promise.all([
      historyRepository.findByPlantId(plantId, { page: query.page, limit: query.limit }),
      historyRepository.countByPlantId(plantId),
    ]);

    return {
      items: rows.map(toHistoryDto),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async listRecent(query: RecentHistoriesQuery, requestUser: AuthenticatedUser): Promise<RecentHistoryDto[]> {
    const rows = await historyRepository.findRecent(
      {
        historyTypeCode: query.type,
        ownerId: ownerFilter(requestUser),
      },
      query.limit,
    );
    return rows.map(toRecentHistoryDto);
  },

  async createByPlantId(
    plantId: string,
    input: CreatePlantHistoryInput,
    requestUser: AuthenticatedUser,
  ): Promise<HistoryDto> {
    const ownerId = await assertCanAccessPlant(plantId, requestUser);
    const historyTypeId = await resolveHistoryTypeId(input.type);

    const row = await historyRepository.create({
      plant: { connect: { id: plantId } },
      owner: { connect: { id: ownerId } },
      historyType: { connect: { id: historyTypeId } },
      performedBy: { connect: { id: requestUser.id } },
      performedAt: input.performedAt ?? new Date(),
      title: input.title ?? null,
      description: input.description ?? null,
      amount: input.amount ?? null,
    });
    return toHistoryDto(row);
  },

  async update(id: string, input: UpdateHistoryInput, requestUser: AuthenticatedUser): Promise<HistoryDto> {
    await assertCanAccessHistory(id, requestUser);

    const data: Parameters<typeof historyRepository.update>[1] = {};
    if (input.type !== undefined) {
      data.historyType = { connect: { id: await resolveHistoryTypeId(input.type) } };
    }
    if (input.description !== undefined) data.description = input.description;
    if (input.performedAt !== undefined) data.performedAt = input.performedAt;
    if (input.title !== undefined) data.title = input.title;
    if (input.amount !== undefined) data.amount = input.amount;

    const updated = await historyRepository.update(id, data);
    return toHistoryDto(updated);
  },

  /** PlantHistory 모델에 soft delete 컬럼이 없어 물리 삭제한다. */
  async remove(id: string, requestUser: AuthenticatedUser): Promise<void> {
    await assertCanAccessHistory(id, requestUser);
    await historyRepository.delete(id);
  },
};
