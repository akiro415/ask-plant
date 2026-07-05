/** GET /locations가 내려주는 위치유형 참조 형태(id/code/name만 포함, sortOrder 등은 미포함) */
export interface LocationTypeRef {
  id: string;
  code: string;
  name: string;
}

export interface PlantLocation {
  id: string;
  code: string;
  name: string;
  type: LocationTypeRef | null;
  parentId: string | null;
  parentName: string | null;
  imagePath: string | null;
  posX: number | null;
  posY: number | null;
  depth: number;
  plantCount: number;
}
