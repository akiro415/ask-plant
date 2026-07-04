export interface CommonCode {
  id: string;
  groupCode: string;
  code: string;
  name: string;
  sortOrder: number;
}

export interface PlantCategory {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
}

export interface LocationRef {
  id: string;
  name: string;
}
