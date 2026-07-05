import { settingsRepository } from '../repositories/settings.repository';
import { commonCodeRepository } from '../repositories/common-code.repository';
import { ValidationAppError } from '../middleware/errorHandler';
import type { UpdateSettingsInput } from '../schemas/settings.schema';

export interface SystemSettingsDto {
  serviceName: string;
  defaultLanguage: string;
  defaultPlantStatusCode: string;
  notifyOrder: boolean;
  notifyLowStock: boolean;
  notifyWeeklyReport: boolean;
  qrCodeDigits: number;
  labelPaperSize: string;
  updatedAt: Date;
}

function toDto(row: Awaited<ReturnType<typeof settingsRepository.getOrCreate>>): SystemSettingsDto {
  return {
    serviceName: row.serviceName,
    defaultLanguage: row.defaultLanguage,
    defaultPlantStatusCode: row.defaultPlantStatusCode,
    notifyOrder: row.notifyOrder,
    notifyLowStock: row.notifyLowStock,
    notifyWeeklyReport: row.notifyWeeklyReport,
    qrCodeDigits: row.qrCodeDigits,
    labelPaperSize: row.labelPaperSize,
    updatedAt: row.updatedAt,
  };
}

async function assertValidPlantStatusCode(code: string): Promise<void> {
  const status = await commonCodeRepository.findByGroupAndCode('PLANT_STATUS', code);
  if (!status) {
    throw new ValidationAppError('유효하지 않은 기본 Plant 상태입니다', [
      { field: 'defaultPlantStatusCode', message: `PLANT_STATUS code '${code}'를 찾을 수 없습니다` },
    ]);
  }
}

export const settingsService = {
  async get(): Promise<SystemSettingsDto> {
    const row = await settingsRepository.getOrCreate();
    return toDto(row);
  },

  async update(input: UpdateSettingsInput): Promise<SystemSettingsDto> {
    if (input.defaultPlantStatusCode !== undefined) {
      await assertValidPlantStatusCode(input.defaultPlantStatusCode);
    }
    const row = await settingsRepository.update(input);
    return toDto(row);
  },
};
