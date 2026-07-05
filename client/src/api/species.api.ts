import { httpClient } from './http';

export interface SpeciesOption {
  id: string;
  displayName: string;
  scientificName: string | null;
  koreanName: string | null;
  category: { id: string; code: string; name: string } | null;
}

interface SpeciesListResponse {
  data: SpeciesOption[];
}

/** GET /api/v1/species — Plant 등록 폼의 품종 select 옵션 (value=id, label=displayName) */
export async function fetchSpeciesOptions(): Promise<SpeciesOption[]> {
  const { data } = await httpClient.get<SpeciesListResponse>('/species');
  return data.data;
}
