import type { CommonCode } from './common';

export interface PlantLocation {
  id: string;
  code: string;
  name: string;
  type: CommonCode | null;
  parentId: string | null;
  parentName: string | null;
  imagePath: string | null;
  posX: number | null;
  posY: number | null;
  depth: number;
  plantCount: number;
}
