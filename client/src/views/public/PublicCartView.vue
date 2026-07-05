<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCartStore } from '@/stores/cart';
import { usePublicCartStore } from '@/stores/publicCart';
import { useAuthStore } from '@/stores/auth';
import { createOrderRequest } from '@/api/order-request.api';
import { formatCurrency } from '@/utils/format';
import { RouterLink } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import { placeholderImage } from '@/utils/placeholder';

const cart = useCartStore();
const publicCart = usePublicCartStore();
const auth = useAuthStore();

const isGuest = computed(() => !auth.isAuthenticated);
const guestItems = computed(() => publicCart.items);
const hasItems = computed(() => (isGuest.value ? guestItems.value.length > 0 : cart.items.length > 0));

const orderLoading = ref(false);
const orderResult = ref<{ message: string; bankAccountInfo: string | null; bankAccountHolder: string | null } | null>(null);
const orderError = ref<string | null>(null);
const form = ref({ customerName: '', customerPhone: '', customerEmail: '', memo: '' });

function imageUrlGuest(qrCode: string, displayName: string, imageUrl: string | null) {
  return imageUrl ?? placeholderImage(qrCode, displayName.slice(0, 1) || '🌵', 112);
}

function imageUrlAuth(item: (typeof cart.items)[number]) {
  return item.plant.latestImage?.url ?? placeholderImage(item.plant.qrCode, '🌵', 112);
}

async function changeQtyAuth(id: string, quantity: number) {
  if (quantity < 1) {
    await cart.remove(id);
    return;
  }
  await cart.changeQuantity(id, quantity);
}

onMounted(() => {
  if (auth.isAuthenticated) void cart.loadCart();
});

async function submitOrderRequest() {
  if (!isGuest.value || guestItems.value.length === 0) return;
  orderLoading.value = true;
  orderError.value = null;
  try {
    const result = await createOrderRequest({
      sessionId: publicCart.sessionId,
      customerName: form.value.customerName.trim(),
      customerPhone: form.value.customerPhone.trim(),
      customerEmail: form.value.customerEmail.trim() || undefined,
      memo: form.value.memo.trim() || undefined,
      items: guestItems.value.map((i) => ({
        qrCode: i.qrCode,
        quantity: i.quantity,
        priceSnapshot: i.priceSnapshot,
      })),
    });
    orderResult.value = result;
    publicCart.clear();
  } catch (err) {
    orderError.value = err instanceof Error ? err.message : '구매 요청에 실패했습니다';
  } finally {
    orderLoading.value = false;
  }
}
</script>

<template>
  <div class="cart-page">
    <h1 class="cart-title">🛒 장바구니</h1>

    <!-- 로그인 사용자: API 장바구니 -->
    <template v-if="!isGuest">
      <div v-if="cart.loading" class="cart-status">
        <EmptyState message="장바구니를 불러오는 중입니다..." icon="⏳" />
      </div>
      <div v-else-if="cart.error" class="cart-status">
        <EmptyState :message="cart.error" icon="⚠️" />
        <BaseButton variant="outline" size="sm" @click="cart.loadCart">다시 시도</BaseButton>
      </div>
      <div v-else-if="cart.items.length === 0" class="cart-empty">
        <p>장바구니가 비어있습니다.</p>
        <BaseButton variant="outline" to="/p">둘러보러 가기</BaseButton>
      </div>
      <template v-else>
        <div class="cart-list">
          <div v-for="item in cart.items" :key="item.id" class="cart-item">
            <RouterLink :to="`/p/${item.plant.qrCode}`">
              <img :src="imageUrlAuth(item)" alt="" loading="lazy" />
            </RouterLink>
            <div class="cart-item-body">
              <RouterLink :to="`/p/${item.plant.qrCode}`" class="cart-item-name">
                {{ item.plant.nickname ?? item.plant.species.displayName }}
              </RouterLink>
              <div class="cart-item-sub">{{ item.plant.species.displayName }}</div>
              <div class="cart-item-price">{{ formatCurrency(item.plant.sellingPrice) }}</div>
              <div class="cart-item-qty">
                <button type="button" class="qty-btn" :disabled="cart.actionLoading" @click="changeQtyAuth(item.id, item.quantity - 1)">−</button>
                <span>{{ item.quantity }}</span>
                <button type="button" class="qty-btn" :disabled="cart.actionLoading" @click="changeQtyAuth(item.id, item.quantity + 1)">+</button>
              </div>
            </div>
            <button type="button" class="cart-item-remove" :disabled="cart.actionLoading" @click="cart.remove(item.id)">✕</button>
          </div>
        </div>
        <div class="cart-total-row">
          <span>총 {{ cart.totalCount }}개</span>
          <span class="cart-total-amount">{{ formatCurrency(cart.totalAmount) }}</span>
        </div>
        <div class="public-cta-bar">
          <BaseButton variant="outline" :disabled="cart.actionLoading" @click="cart.clear">비우기</BaseButton>
        </div>
      </template>
    </template>

    <!-- 비로그인: localStorage 장바구니 + 구매 요청 -->
    <template v-else>
      <div v-if="orderResult" class="order-success panel">
        <p>{{ orderResult.message }}</p>
        <p v-if="orderResult.bankAccountHolder && orderResult.bankAccountInfo" class="bank-info">
          입금 계좌: {{ orderResult.bankAccountHolder }} {{ orderResult.bankAccountInfo }}
        </p>
        <BaseButton variant="outline" to="/p">쇼케이스로</BaseButton>
      </div>
      <div v-else-if="!hasItems" class="cart-empty">
        <p>장바구니가 비어있습니다.</p>
        <BaseButton variant="outline" to="/p">둘러보러 가기</BaseButton>
      </div>
      <template v-else>
        <div class="cart-list">
          <div v-for="item in guestItems" :key="item.qrCode" class="cart-item">
            <RouterLink :to="`/p/${item.qrCode}`">
              <img :src="imageUrlGuest(item.qrCode, item.displayName, item.imageUrl)" alt="" loading="lazy" />
            </RouterLink>
            <div class="cart-item-body">
              <RouterLink :to="`/p/${item.qrCode}`" class="cart-item-name">{{ item.displayName }}</RouterLink>
              <div class="cart-item-price">{{ formatCurrency(item.priceSnapshot) }}</div>
              <div class="cart-item-qty">
                <button type="button" class="qty-btn" @click="publicCart.changeQuantity(item.qrCode, item.quantity - 1)">−</button>
                <span>{{ item.quantity }}</span>
                <button type="button" class="qty-btn" @click="publicCart.changeQuantity(item.qrCode, item.quantity + 1)">+</button>
              </div>
            </div>
            <button type="button" class="cart-item-remove" @click="publicCart.remove(item.qrCode)">✕</button>
          </div>
        </div>
        <div class="cart-total-row">
          <span>총 {{ publicCart.totalQuantity }}개</span>
          <span class="cart-total-amount">{{ formatCurrency(publicCart.totalAmount) }}</span>
        </div>
        <section class="order-form panel">
          <h2 class="order-form-title">구매 요청</h2>
          <BaseInput v-model="form.customerName" label="이름" required />
          <BaseInput v-model="form.customerPhone" label="연락처" required />
          <BaseInput v-model="form.customerEmail" label="이메일" type="email" />
          <BaseInput v-model="form.memo" label="메모" />
          <p v-if="orderError" class="form-error">{{ orderError }}</p>
          <div class="public-cta-bar">
            <BaseButton variant="outline" @click="publicCart.clear">비우기</BaseButton>
            <BaseButton
              variant="primary"
              :disabled="orderLoading || !form.customerName.trim() || !form.customerPhone.trim()"
              @click="submitOrderRequest"
            >
              {{ orderLoading ? '접수 중...' : '구매 요청' }}
            </BaseButton>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.cart-page {
  padding: 1rem 1.1rem 1rem;
}

.cart-title {
  font-size: 1.15rem;
  margin-bottom: 1rem;
}

.cart-status,
.cart-empty {
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.cart-empty {
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  background: white;
  border-radius: var(--radius-md);
  padding: 0.6rem;
  box-shadow: var(--shadow-sm);
}

.cart-item img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.cart-item-body {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  display: block;
}

.cart-item-sub {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.cart-item-price {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 700;
  margin-top: 0.15rem;
}

.cart-item-qty {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.35rem;
  font-size: 0.82rem;
}

.qty-btn {
  width: 1.6rem;
  height: 1.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.cart-item-remove {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.4rem;
}

.cart-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.3rem;
  font-size: 0.95rem;
  font-weight: 700;
}

.cart-total-amount {
  color: var(--color-primary);
  font-size: 1.15rem;
}

.public-cta-bar {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.order-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-form-title {
  font-size: 0.95rem;
  font-weight: 700;
}

.order-success {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bank-info {
  font-weight: 600;
  color: var(--color-primary);
}
</style>
