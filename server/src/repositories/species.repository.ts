import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import type { CreateSpeciesInput, UpdateSpeciesInput } from '../schemas/species.schema';

const selectForList = {
  id: true,
  displayName: true,
  scientificName: true,
  koreanName: true,
  category: { select: { id: true, code: true, name: true } },
} satisfies Prisma.SpeciesSelect;

const selectForDetail = {
  ...selectForList,
  englishName: true,
  fieldNumber: true,
  sellerName: true,
  taxonRank: true,
  isHybrid: true,
  parentSpecies1Id: true,
  parentSpecies2Id: true,
  family: true,
  genus: true,
  description: true,
  careGuide: true,
  defaultWateringCycleDays: true,
  thumbnailUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SpeciesSelect;

export type SpeciesSelectRow = Prisma.SpeciesGetPayload<{ select: typeof selectForList }>;
export type SpeciesDetailRow = Prisma.SpeciesGetPayload<{ select: typeof selectForDetail }>;

export interface SpeciesFilters {
  q?: string;
  categoryId?: string;
  /** 기본값 false — 지정하지 않으면 기존 API와 동일하게 활성 품종만 반환한다. */
  includeInactive?: boolean;
}

function buildWhere(filters: SpeciesFilters): Prisma.SpeciesWhereInput {
  const where: Prisma.SpeciesWhereInput = {};
  if (!filters.includeInactive) where.isActive = true;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.q) {
    where.OR = [
      { displayName: { contains: filters.q, mode: 'insensitive' } },
      { scientificName: { contains: filters.q, mode: 'insensitive' } },
      { koreanName: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const speciesRepository = {
  /**
   * Plant 등록 폼 select 옵션 + 품종관리(Species) 관리자 화면 목록 조회 겸용.
   * 기본은 활성 품종만(하위 호환). 상세 select를 그대로 사용해 관리자 화면에 필요한 전 필드를 함께 내려준다 —
   * 기존 최소 필드(id/displayName/scientificName/koreanName/category)만 쓰는 소비자는 영향 없다.
   */
  async findMany(filters: SpeciesFilters = {}): Promise<SpeciesDetailRow[]> {
    return prisma.species.findMany({
      where: buildWhere(filters),
      select: selectForDetail,
      orderBy: { displayName: 'asc' },
    });
  },

  async findById(id: string): Promise<SpeciesDetailRow | null> {
    return prisma.species.findUnique({ where: { id }, select: selectForDetail });
  },

  async create(data: CreateSpeciesInput): Promise<SpeciesDetailRow> {
    return prisma.species.create({
      data: {
        displayName: data.displayName,
        scientificName: data.scientificName ?? undefined,
        englishName: data.englishName ?? undefined,
        koreanName: data.koreanName ?? undefined,
        fieldNumber: data.fieldNumber ?? undefined,
        sellerName: data.sellerName ?? undefined,
        taxonRank: data.taxonRank,
        isHybrid: data.isHybrid,
        parentSpecies1Id: data.parentSpecies1Id ?? undefined,
        parentSpecies2Id: data.parentSpecies2Id ?? undefined,
        categoryId: data.categoryId ?? undefined,
        family: data.family ?? undefined,
        genus: data.genus ?? undefined,
        description: data.description ?? undefined,
        careGuide: data.careGuide ?? undefined,
        defaultWateringCycleDays: data.defaultWateringCycleDays ?? undefined,
        thumbnailUrl: data.thumbnailUrl ?? undefined,
      },
      select: selectForDetail,
    });
  },

  async update(id: string, data: UpdateSpeciesInput): Promise<SpeciesDetailRow> {
    return prisma.species.update({
      where: { id },
      data: {
        displayName: data.displayName ?? undefined,
        scientificName: data.scientificName === undefined ? undefined : data.scientificName,
        englishName: data.englishName === undefined ? undefined : data.englishName,
        koreanName: data.koreanName === undefined ? undefined : data.koreanName,
        fieldNumber: data.fieldNumber === undefined ? undefined : data.fieldNumber,
        sellerName: data.sellerName === undefined ? undefined : data.sellerName,
        taxonRank: data.taxonRank ?? undefined,
        isHybrid: data.isHybrid ?? undefined,
        parentSpecies1Id: data.parentSpecies1Id === undefined ? undefined : data.parentSpecies1Id,
        parentSpecies2Id: data.parentSpecies2Id === undefined ? undefined : data.parentSpecies2Id,
        categoryId: data.categoryId === undefined ? undefined : data.categoryId,
        family: data.family === undefined ? undefined : data.family,
        genus: data.genus === undefined ? undefined : data.genus,
        description: data.description === undefined ? undefined : data.description,
        careGuide: data.careGuide === undefined ? undefined : data.careGuide,
        defaultWateringCycleDays: data.defaultWateringCycleDays === undefined ? undefined : data.defaultWateringCycleDays,
        thumbnailUrl: data.thumbnailUrl === undefined ? undefined : data.thumbnailUrl,
        isActive: data.isActive ?? undefined,
      },
      select: selectForDetail,
    });
  },

  /** 삭제 대상 품종을 참조하는(soft-delete 안 된) 개체 수 — FK 보호를 위해 삭제 전 확인한다. */
  async countPlantsUsing(id: string): Promise<number> {
    return prisma.plant.count({ where: { speciesId: id, deletedAt: null } });
  },

  /** 실제 row는 삭제하지 않고 isActive만 false로 바꾼다 — Plant.speciesId FK가 절대 깨지지 않는다. */
  async softDelete(id: string): Promise<void> {
    await prisma.species.update({ where: { id }, data: { isActive: false } });
  },
};
