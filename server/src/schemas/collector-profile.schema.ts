import { z } from 'zod';

const nullableString = () => z.string().trim().min(1).nullable().optional();

export const updateCollectorProfileSchema = z.object({
  nickname: nullableString(),
  bio: nullableString(),
  avatarUrl: nullableString(),
  region: nullableString(),
  snsUrl: nullableString(),
  bankAccountInfo: nullableString(),
  bankAccountHolder: nullableString(),
  bankPublic: z.boolean().optional(),
});

export type UpdateCollectorProfileInput = z.infer<typeof updateCollectorProfileSchema>;
