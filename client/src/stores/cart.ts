import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { CartItem, CartSummary, CartToast } from '@/types/cart';
import { addCartItem, clearCart, fetchCart, removeCartItem, updateCartItem } from '@/api/cart.api';
import { extractErrorMessage } from '@/api/http';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const meta = ref<CartSummary['meta']>({ itemCount: 0, totalQuantity: 0, totalAmount: 0 });

  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  const toast = ref<CartToast | null>(null);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  const totalAmount = computed(() => meta.value.totalAmount);
  const totalCount = computed(() => meta.value.totalQuantity);
  const badgeCount = computed(() => meta.value.itemCount);

  function showToast(message: string, type: CartToast['type'] = 'success') {
    toast.value = { message, type };
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.value = null;
    }, 2800);
  }

  function clearToast() {
    toast.value = null;
    if (toastTimer) clearTimeout(toastTimer);
  }

  function syncFromSummary(summary: CartSummary) {
    items.value = summary.items;
    meta.value = summary.meta;
    loaded.value = true;
  }

  function isInCart(qrCode: string) {
    return items.value.some((item) => item.plant.qrCode === qrCode);
  }

  function findItemByQrCode(qrCode: string) {
    return items.value.find((item) => item.plant.qrCode === qrCode) ?? null;
  }

  /** GET /cart */
  async function loadCart() {
    loading.value = true;
    error.value = null;
    try {
      const summary = await fetchCart();
      syncFromSummary(summary);
    } catch (err) {
      error.value = extractErrorMessage(err, '장바구니를 불러오지 못했습니다');
      items.value = [];
      meta.value = { itemCount: 0, totalQuantity: 0, totalAmount: 0 };
    } finally {
      loading.value = false;
    }
  }

  /** POST /cart/items — qrCode 또는 plantId */
  async function addByQrCode(qrCode: string, quantity = 1): Promise<boolean> {
    actionLoading.value = true;
    try {
      const summary = await addCartItem({ qrCode, quantity });
      syncFromSummary(summary);
      showToast('장바구니에 담았습니다');
      return true;
    } catch (err) {
      showToast(extractErrorMessage(err, '장바구니 추가에 실패했습니다'), 'error');
      return false;
    } finally {
      actionLoading.value = false;
    }
  }

  async function addByPlantId(plantId: string, quantity = 1): Promise<boolean> {
    actionLoading.value = true;
    try {
      const summary = await addCartItem({ plantId, quantity });
      syncFromSummary(summary);
      showToast('장바구니에 담았습니다');
      return true;
    } catch (err) {
      showToast(extractErrorMessage(err, '장바구니 추가에 실패했습니다'), 'error');
      return false;
    } finally {
      actionLoading.value = false;
    }
  }

  /** PUT /cart/items/:id */
  async function changeQuantity(id: string, quantity: number): Promise<boolean> {
    actionLoading.value = true;
    try {
      const summary = await updateCartItem(id, { quantity });
      syncFromSummary(summary);
      return true;
    } catch (err) {
      showToast(extractErrorMessage(err, '수량 변경에 실패했습니다'), 'error');
      return false;
    } finally {
      actionLoading.value = false;
    }
  }

  /** DELETE /cart/items/:id */
  async function remove(id: string): Promise<boolean> {
    actionLoading.value = true;
    try {
      const summary = await removeCartItem(id);
      syncFromSummary(summary);
      showToast('장바구니에서 제거했습니다', 'info');
      return true;
    } catch (err) {
      showToast(extractErrorMessage(err, '삭제에 실패했습니다'), 'error');
      return false;
    } finally {
      actionLoading.value = false;
    }
  }

  /** DELETE /cart/clear */
  async function clear(): Promise<boolean> {
    actionLoading.value = true;
    try {
      const summary = await clearCart();
      syncFromSummary(summary);
      showToast('장바구니를 비웠습니다', 'info');
      return true;
    } catch (err) {
      showToast(extractErrorMessage(err, '비우기에 실패했습니다'), 'error');
      return false;
    } finally {
      actionLoading.value = false;
    }
  }

  function reset() {
    items.value = [];
    meta.value = { itemCount: 0, totalQuantity: 0, totalAmount: 0 };
    loaded.value = false;
    error.value = null;
  }

  return {
    items,
    meta,
    loading,
    actionLoading,
    error,
    loaded,
    toast,
    totalAmount,
    totalCount,
    badgeCount,
    showToast,
    clearToast,
    isInCart,
    findItemByQrCode,
    loadCart,
    addByQrCode,
    addByPlantId,
    changeQuantity,
    remove,
    clear,
    reset,
  };
});
