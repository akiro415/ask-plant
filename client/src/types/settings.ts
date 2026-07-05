/** GET/PUT /settings 응답 */
export interface SystemSettings {
  serviceName: string;
  defaultLanguage: string;
  defaultPlantStatusCode: string;
  notifyOrder: boolean;
  notifyLowStock: boolean;
  notifyWeeklyReport: boolean;
  qrCodeDigits: number;
  labelPaperSize: string;
  updatedAt: string;
}

export type UpdateSystemSettingsPayload = Partial<
  Pick<
    SystemSettings,
    | 'serviceName'
    | 'defaultLanguage'
    | 'defaultPlantStatusCode'
    | 'notifyOrder'
    | 'notifyLowStock'
    | 'notifyWeeklyReport'
    | 'qrCodeDigits'
    | 'labelPaperSize'
  >
>;
