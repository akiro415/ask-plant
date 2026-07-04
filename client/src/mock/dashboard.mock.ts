import type { DashboardSummary } from '@/types/dashboard';
import { mockPlantSummaries, mockPlantDetails } from './index';
import { mockSpeciesList } from './species.mock';
import { mockLocations } from './locations.mock';
import { mockHistories } from './histories.mock';
import { mockImages } from './images.mock';

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function buildDashboardSummary(recentLimit = 5): DashboardSummary {
  const statusCounts: Record<string, number> = {};
  for (const plant of mockPlantSummaries) {
    statusCounts[plant.status.code] = (statusCounts[plant.status.code] ?? 0) + 1;
  }

  const todayRegisteredCount = mockPlantSummaries.filter((p) => isToday(p.createdAt)).length;

  const repots = mockHistories
    .filter((h) => h.historyType.code === 'REPOT')
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
    .slice(0, recentLimit)
    .map((h) => {
      const plant = mockPlantDetails.find((p) => p.id === h.plantId)!;
      return {
        plantId: plant.id,
        qrCode: plant.qrCode,
        plantName: plant.species.displayName,
        performedAt: h.performedAt,
      };
    });

  const sales = mockHistories
    .filter((h) => h.historyType.code === 'SALE')
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
    .slice(0, recentLimit)
    .map((h) => {
      const plant = mockPlantDetails.find((p) => p.id === h.plantId)!;
      return {
        plantId: plant.id,
        qrCode: plant.qrCode,
        plantName: plant.species.displayName,
        amount: h.amount,
        performedAt: h.performedAt,
      };
    });

  const recentImages = [...mockImages]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, recentLimit)
    .map((img) => {
      const plant = mockPlantDetails.find((p) => p.id === img.plantId)!;
      return {
        plantId: plant.id,
        qrCode: plant.qrCode,
        imageUrl: img.url,
        imageType: img.imageType,
        createdAt: img.createdAt,
      };
    });

  return {
    totalPlants: mockPlantSummaries.length,
    totalSpecies: mockSpeciesList.length,
    statusCounts,
    totalLocations: mockLocations.length,
    todayRegisteredCount,
    recentRepots: repots,
    recentSales: sales,
    recentImages,
  };
}
