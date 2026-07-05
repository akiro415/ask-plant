import prisma from '../lib/prisma';

const DEFAULT_ID = 'default';

export type SystemSettingsRow = Awaited<ReturnType<typeof settingsRepository.getOrCreate>>;

export const settingsRepository = {
  async getOrCreate() {
    const existing = await prisma.systemSettings.findUnique({ where: { id: DEFAULT_ID } });
    if (existing) return existing;
    return prisma.systemSettings.create({
      data: { id: DEFAULT_ID },
    });
  },

  async update(data: {
    serviceName?: string;
    defaultLanguage?: string;
    defaultPlantStatusCode?: string;
    notifyOrder?: boolean;
    notifyLowStock?: boolean;
    notifyWeeklyReport?: boolean;
    qrCodeDigits?: number;
    labelPaperSize?: string;
  }) {
    await this.getOrCreate();
    return prisma.systemSettings.update({
      where: { id: DEFAULT_ID },
      data,
    });
  },
};
