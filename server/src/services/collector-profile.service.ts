import { collectorProfileRepository } from '../repositories/collector-profile.repository';
import type { UpdateCollectorProfileInput } from '../schemas/collector-profile.schema';
import type { AuthenticatedUser } from '../types/express';

export interface CollectorProfileDto {
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
}

function toDto(row: NonNullable<Awaited<ReturnType<typeof collectorProfileRepository.findByUserId>>>): CollectorProfileDto {
  return { ...row };
}

export const collectorProfileService = {
  async getMine(user: AuthenticatedUser): Promise<CollectorProfileDto | null> {
    const row = await collectorProfileRepository.findByUserId(user.id);
    return row ? toDto(row) : null;
  },

  async upsertMine(user: AuthenticatedUser, input: UpdateCollectorProfileInput): Promise<CollectorProfileDto> {
    const row = await collectorProfileRepository.upsert(user.id, input);
    return toDto(row);
  },
};
