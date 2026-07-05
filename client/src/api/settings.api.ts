import { httpClient } from './http';
import type { SystemSettings, UpdateSystemSettingsPayload } from '@/types/settings';

interface SettingsResponse {
  data: SystemSettings;
}

/** GET /api/v1/settings — 시스템 설정 조회 (ADMIN/STAFF) */
export async function fetchSystemSettings(): Promise<SystemSettings> {
  const { data } = await httpClient.get<SettingsResponse>('/settings');
  return data.data;
}

/** PUT /api/v1/settings — 시스템 설정 수정 (ADMIN) */
export async function updateSystemSettings(payload: UpdateSystemSettingsPayload): Promise<SystemSettings> {
  const { data } = await httpClient.put<SettingsResponse>('/settings', payload);
  return data.data;
}
