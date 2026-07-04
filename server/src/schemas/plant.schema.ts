import { z } from 'zod';

export const createPlantSchema = z.object({
  name: z.string().min(1, '식물 이름은 필수입니다'),
  species: z.string().optional(),
  location: z.string().optional(),
  acquiredAt: z.string().datetime().optional(),
  wateringCycle: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const updatePlantSchema = createPlantSchema.partial();

export const createWateringSchema = z.object({
  plantId: z.string().min(1),
  wateredAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type CreatePlantInput = z.infer<typeof createPlantSchema>;
export type UpdatePlantInput = z.infer<typeof updatePlantSchema>;
export type CreateWateringInput = z.infer<typeof createWateringSchema>;
