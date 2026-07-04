import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { PlantDetail } from '@/types/plant';

export interface CartItem {
  plant: PlantDetail;
  quantity: number;
}

/** Public(모바일) 화면 전용 — 실제 API 없이 세션 내 메모리 상태로만 유지되는 목업 장바구니 */
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const totalAmount = computed(() => items.value.reduce((sum, item) => sum + (item.plant.sellingPrice ?? 0) * item.quantity, 0));
  const totalCount = computed(() => items.value.length);

  function isInCart(plantId: string) {
    return items.value.some((item) => item.plant.id === plantId);
  }

  function add(plant: PlantDetail) {
    if (isInCart(plant.id)) return;
    items.value.push({ plant, quantity: 1 });
  }

  function remove(plantId: string) {
    items.value = items.value.filter((item) => item.plant.id !== plantId);
  }

  function clear() {
    items.value = [];
  }

  return { items, totalAmount, totalCount, isInCart, add, remove, clear };
});
