import { z } from 'zod';

/** PUT /settings 요청 */
export const updateSettingsSchema = z
  .object({
    serviceName: z.string().trim().min(1).optional(),
    defaultLanguage: z.string().trim().min(2).max(10).optional(),
    defaultPlantStatusCode: z.string().trim().min(1).optional(),
    notifyOrder: z.boolean().optional(),
    notifyLowStock: z.boolean().optional(),
    notifyWeeklyReport: z.boolean().optional(),
    qrCodeDigits: z.number().int().min(4).max(10).optional(),
    labelPaperSize: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 필드가 하나 이상 필요합니다' });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
