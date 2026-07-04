export interface DashboardRecentHistoryItem {
  plantId: string;
  qrCode: string;
  plantName: string;
  amount?: number | null;
  performedAt: string;
}

export interface DashboardRecentImageItem {
  plantId: string;
  qrCode: string;
  imageUrl: string;
  imageType: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalPlants: number;
  totalSpecies: number;
  statusCounts: Record<string, number>;
  totalLocations: number;
  todayRegisteredCount: number;
  recentRepots: DashboardRecentHistoryItem[];
  recentSales: DashboardRecentHistoryItem[];
  recentImages: DashboardRecentImageItem[];
}
