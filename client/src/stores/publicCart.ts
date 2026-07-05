import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const STORAGE_KEY = 'ask-plant.public-cart';
const SESSION_KEY = 'ask-plant.public-session';

export interface PublicCartItem {
  qrCode: string;
  displayName: string;
  imageUrl: string | null;
  priceSnapshot: number;
  quantity: number;
}

function loadSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function loadItems(): PublicCartItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PublicCartItem[];
  } catch {
    return [];
  }
}

function saveItems(items: PublicCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const usePublicCartStore = defineStore('publicCart', () => {
  const items = ref<PublicCartItem[]>(loadItems());
  const sessionId = ref(loadSessionId());

  const totalQuantity = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0));
  const totalAmount = computed(() => items.value.reduce((sum, i) => sum + i.priceSnapshot * i.quantity, 0));
  const badgeCount = computed(() => items.value.length);

  function persist() {
    saveItems(items.value);
  }

  function addItem(item: Omit<PublicCartItem, 'quantity'>, quantity = 1) {
    const existing = items.value.find((i) => i.qrCode === item.qrCode);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.value.push({ ...item, quantity });
    }
    persist();
  }

  function changeQuantity(qrCode: string, quantity: number) {
    const row = items.value.find((i) => i.qrCode === qrCode);
    if (!row) return;
    if (quantity < 1) {
      remove(qrCode);
      return;
    }
    row.quantity = quantity;
    persist();
  }

  function remove(qrCode: string) {
    items.value = items.value.filter((i) => i.qrCode !== qrCode);
    persist();
  }

  function clear() {
    items.value = [];
    persist();
  }

  function isInCart(qrCode: string) {
    return items.value.some((i) => i.qrCode === qrCode);
  }

  return {
    items,
    sessionId,
    totalQuantity,
    totalAmount,
    badgeCount,
    addItem,
    changeQuantity,
    remove,
    clear,
    isInCart,
  };
});
