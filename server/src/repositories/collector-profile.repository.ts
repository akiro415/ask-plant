import prisma from '../lib/prisma';
import type { UpdateCollectorProfileInput } from '../schemas/collector-profile.schema';

const selectRow = {
  id: true,
  userId: true,
  nickname: true,
  bio: true,
  avatarUrl: true,
  region: true,
  snsUrl: true,
  bankAccountInfo: true,
  bankAccountHolder: true,
  bankPublic: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type CollectorProfileRow = {
  id: string;
  userId: string;
  nickname: string | null;
  bio: string | null;
  avatarUrl: string | null;
  region: string | null;
  snsUrl: string | null;
  bankAccountInfo: string | null;
  bankAccountHolder: string | null;
  bankPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const collectorProfileRepository = {
  async findByUserId(userId: string): Promise<CollectorProfileRow | null> {
    return prisma.collectorProfile.findUnique({ where: { userId }, select: selectRow });
  },

  async upsert(userId: string, data: UpdateCollectorProfileInput): Promise<CollectorProfileRow> {
    return prisma.collectorProfile.upsert({
      where: { userId },
      create: {
        userId,
        nickname: data.nickname ?? undefined,
        bio: data.bio ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
        region: data.region ?? undefined,
        snsUrl: data.snsUrl ?? undefined,
        bankAccountInfo: data.bankAccountInfo ?? undefined,
        bankAccountHolder: data.bankAccountHolder ?? undefined,
        bankPublic: data.bankPublic ?? false,
      },
      update: {
        nickname: data.nickname === undefined ? undefined : data.nickname,
        bio: data.bio === undefined ? undefined : data.bio,
        avatarUrl: data.avatarUrl === undefined ? undefined : data.avatarUrl,
        region: data.region === undefined ? undefined : data.region,
        snsUrl: data.snsUrl === undefined ? undefined : data.snsUrl,
        bankAccountInfo: data.bankAccountInfo === undefined ? undefined : data.bankAccountInfo,
        bankAccountHolder: data.bankAccountHolder === undefined ? undefined : data.bankAccountHolder,
        bankPublic: data.bankPublic === undefined ? undefined : data.bankPublic,
      },
      select: selectRow,
    });
  },
};
