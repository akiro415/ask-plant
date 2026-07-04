<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { formatCurrency } from '@/utils/format';
import { RouterLink } from 'vue-router';

const cart = useCartStore();
</script>

<template>
  <div class="cart-page">
    <h1 class="cart-title">🛒 장바구니</h1>

    <div v-if="cart.items.length === 0" class="cart-empty">
      <p>장바구니가 비어있습니다.</p>
      <RouterLink to="/p" class="btn btn-outline">둘러보러 가기</RouterLink>
    </div>

    <template v-else>
      <div class="cart-list">
        <div v-for="item in cart.items" :key="item.plant.id" class="cart-item">
          <img :src="item.plant.primaryImageUrl" alt="" />
          <div class="cart-item-body">
            <div class="cart-item-name">{{ item.plant.nickname ?? item.plant.species.displayName }}</div>
            <div class="cart-item-price">{{ formatCurrency(item.plant.sellingPrice) }}</div>
          </div>
          <button type="button" class="cart-item-remove" @click="cart.remove(item.plant.id)">✕</button>
        </div>
      </div>

      <div class="cart-total-row">
        <span>총 합계</span>
        <span class="cart-total-amount">{{ formatCurrency(cart.totalAmount) }}</span>
      </div>

      <div class="public-cta-bar">
        <button type="button" class="btn btn-outline" @click="cart.clear">비우기</button>
        <button type="button" class="btn btn-primary" disabled title="Mock 화면에서는 비활성화됩니다">문의 접수하기</button>
      </div>
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

.cart-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c7a72;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: white;
  border-radius: 10px;
  padding: 0.6rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.cart-item img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.cart-item-body {
  flex: 1;
}

.cart-item-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1b2420;
}

.cart-item-price {
  font-size: 0.8rem;
  color: #2d6a4f;
  font-weight: 700;
}

.cart-item-remove {
  border: none;
  background: none;
  color: #a0aaa4;
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
  color: #2d6a4f;
  font-size: 1.15rem;
}
</style>
