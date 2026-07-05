import { httpClient } from './http';

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
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCollectorProfilePayload {
  nickname?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  region?: string | null;
  snsUrl?: string | null;
  bankAccountInfo?: string | null;
  bankAccountHolder?: string | null;
  bankPublic?: boolean;
}

interface CollectorProfileResponse {
  data: CollectorProfileDto | null;
}

export async function fetchCollectorProfile(): Promise<CollectorProfileDto | null> {
  const { data } = await httpClient.get<CollectorProfileResponse>('/collector-profile/me');
  return data.data;
}

export async function updateCollectorProfile(payload: UpdateCollectorProfilePayload): Promise<CollectorProfileDto> {
  const { data } = await httpClient.put<{ data: CollectorProfileDto }>('/collector-profile/me', payload);
  return data.data;
}
