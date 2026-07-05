import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import type { CreateLocationInput, UpdateLocationInput } from '../schemas/location.schema';

const selectRow = {
  id: true,
  code: true,
  name: true,
  description: true,
  typeId: true,
  parentId: true,
  imagePath: true,
  posX: true,
  posY: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  type: { select: { id: true, code: true, name: true } },
  parent: { select: { id: true, code: true, name: true } },
} satisfies Prisma.PlantLocationSelect;

export type LocationRow = Prisma.PlantLocationGetPayload<{ select: typeof selectRow }>;

export interface LocationFilters {
  q?: string;
  parentId?: string;
  typeId?: string;
  /** 기본값 false — 지정하지 않으면 활성 위치만 반환한다. */
  includeInactive?: boolean;
}

function buildWhere(filters: LocationFilters): Prisma.PlantLocationWhereInput {
  const where: Prisma.PlantLocationWhereInput = {};
  if (!filters.includeInactive) where.isActive = true;
  if (filters.parentId) where.parentId = filters.parentId;
  if (filters.typeId) where.typeId = filters.typeId;
  if (filters.q) {
    where.OR = [
      { code: { contains: filters.q, mode: 'insensitive' } },
      { name: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const locationRepository = {
  async findMany(filters: LocationFilters = {}): Promise<LocationRow[]> {
    return prisma.plantLocation.findMany({
      where: buildWhere(filters),
      select: selectRow,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  },

  async findById(id: string): Promise<LocationRow | null> {
    return prisma.plantLocation.findUnique({ where: { id }, select: selectRow });
  },

  async create(data: CreateLocationInput): Promise<LocationRow> {
    return prisma.plantLocation.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description ?? undefined,
        typeId: data.typeId ?? undefined,
        parentId: data.parentId ?? undefined,
        imagePath: data.imagePath ?? undefined,
        posX: data.posX ?? undefined,
        posY: data.posY ?? undefined,
        sortOrder: data.sortOrder,
      },
      select: selectRow,
    });
  },

  async update(id: string, data: UpdateLocationInput): Promise<LocationRow> {
    return prisma.plantLocation.update({
      where: { id },
      data: {
        code: data.code ?? undefined,
        name: data.name ?? undefined,
        description: data.description === undefined ? undefined : data.description,
        typeId: data.typeId === undefined ? undefined : data.typeId,
        parentId: data.parentId === undefined ? undefined : data.parentId,
        imagePath: data.imagePath === undefined ? undefined : data.imagePath,
        posX: data.posX === undefined ? undefined : data.posX,
        posY: data.posY === undefined ? undefined : data.posY,
        sortOrder: data.sortOrder ?? undefined,
        isActive: data.isActive ?? undefined,
      },
      select: selectRow,
    });
  },

  /** 삭제 대상 위치를 참조하는(soft-delete 안 된) 개체 수 — FK 보호를 위해 삭제 전 확인한다. */
  async countPlantsUsing(id: string): Promise<number> {
    return prisma.plant.count({ where: { locationId: id, deletedAt: null } });
  },

  /** 삭제 대상 위치를 상위로 두는 하위 위치 수 — 계층 구조 보호를 위해 삭제 전 확인한다. */
  async countChildren(id: string): Promise<number> {
    return prisma.plantLocation.count({ where: { parentId: id, isActive: true } });
  },

  /** 실제 row는 삭제하지 않고 isActive만 false로 바꾼다 — Plant.locationId FK가 절대 깨지지 않는다. */
  async softDelete(id: string): Promise<void> {
    await prisma.plantLocation.update({ where: { id }, data: { isActive: false } });
  },

  /** parentId로 올라가는 체인을 순회해 targetId를 다시 만나면 순환 참조로 판단한다. */
  async wouldCreateCycle(id: string, newParentId: string): Promise<boolean> {
    let current: string | null = newParentId;
    const visited = new Set<string>();
    while (current) {
      if (current === id) return true;
      if (visited.has(current)) return true; // 이미 존재하는 순환(방어적 처리)
      visited.add(current);
      const parent: { parentId: string | null } | null = await prisma.plantLocation.findUnique({
        where: { id: current },
        select: { parentId: true },
      });
      current = parent?.parentId ?? null;
    }
    return false;
  },
};
