import type { PlantCategory } from '@/types/common';

export const mockCategories: PlantCategory[] = [
  { id: 'cat-con', code: 'CON', name: 'Conophytum 계열', description: '코노피튬속 다육', sortOrder: 1 },
  { id: 'cat-lth', code: 'LTH', name: 'Lithops 계열', description: '리토프스속 다육 (돌 식물)', sortOrder: 2 },
  { id: 'cat-cat', code: 'CAT', name: 'Cactus(선인장) 계열', description: '선인장과 전반', sortOrder: 3 },
  { id: 'cat-afr', code: 'AFR', name: '아프리카 다육 계열', description: '하월시아, 에케베리아 등', sortOrder: 4 },
  { id: 'cat-oth', code: 'OTH', name: '기타/미분류', description: '분류 미지정', sortOrder: 99 },
];

export function findCategory(id: string): PlantCategory | null {
  return mockCategories.find((c) => c.id === id) ?? null;
}
