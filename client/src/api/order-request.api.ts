import { httpClient } from './http';

export interface OrderRequestItem {
  qrCode: string;
  quantity: number;
  priceSnapshot: number;
}

export interface CreateOrderRequestPayload {
  sessionId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  memo?: string;
  items: OrderRequestItem[];
}

export interface OrderRequestResult {
  orderRequestId: string;
  totalAmount: number;
  bankAccountInfo: string | null;
  bankAccountHolder: string | null;
  message: string;
}

interface OrderRequestResponse {
  data: OrderRequestResult;
}

/** POST /api/v1/public/order-request — 로그인 없이 구매 요청 */
export async function createOrderRequest(payload: CreateOrderRequestPayload): Promise<OrderRequestResult> {
  const { data } = await httpClient.post<OrderRequestResponse>('/public/order-request', payload);
  return data.data;
}
