import { httpClient } from './http';
import type { AddCartItemPayload, CartSummary, UpdateCartItemPayload } from '@/types/cart';

interface CartResponse {
  data: CartSummary;
}

/** GET /api/v1/cart */
export async function fetchCart(): Promise<CartSummary> {
  const { data } = await httpClient.get<CartResponse>('/cart');
  return data.data;
}

/** POST /api/v1/cart/items */
export async function addCartItem(payload: AddCartItemPayload): Promise<CartSummary> {
  const { data } = await httpClient.post<CartResponse>('/cart/items', payload);
  return data.data;
}

/** PUT /api/v1/cart/items/:id */
export async function updateCartItem(id: string, payload: UpdateCartItemPayload): Promise<CartSummary> {
  const { data } = await httpClient.put<CartResponse>(`/cart/items/${encodeURIComponent(id)}`, payload);
  return data.data;
}

/** DELETE /api/v1/cart/items/:id */
export async function removeCartItem(id: string): Promise<CartSummary> {
  const { data } = await httpClient.delete<CartResponse>(`/cart/items/${encodeURIComponent(id)}`);
  return data.data;
}

/** DELETE /api/v1/cart/clear */
export async function clearCart(): Promise<CartSummary> {
  const { data } = await httpClient.delete<CartResponse>('/cart/clear');
  return data.data;
}
