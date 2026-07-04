import type { CommonCode, LocationRef } from './common';

export interface PlantHistory {
  id: string;
  plantId: string;
  historyType: CommonCode;
  performedAt: string;
  performedBy: string | null;
  title: string | null;
  description: string | null;
  amount: number | null;
  fromLocation: LocationRef | null;
  toLocation: LocationRef | null;
  image: { id: string; url: string } | null;
  metadata: Record<string, unknown> | null;
}
