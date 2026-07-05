/** GET /cart 응답 항목 */
export interface CartItem {
  id: string;
  plantId: string;
  quantity: number;
  plant: {
    qrCode: string;
    nickname: string | null;
    sellingPrice: number | null;
    status: { code: string; name: string };
    species: { displayName: string };
    latestImage: { url: string; imageType: string } | null;
  };
}

export interface CartSummary {
  items: CartItem[];
  meta: {
    itemCount: number;
    totalQuantity: number;
    totalAmount: number;
  };
}

export interface AddCartItemPayload {
  plantId?: string;
  qrCode?: string;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export type CartToastType = 'success' | 'error' | 'info';

export interface CartToast {
  message: string;
  type: CartToastType;
}
