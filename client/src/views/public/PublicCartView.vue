<script setup lang="ts">

import { onMounted } from 'vue';

import { useCartStore } from '@/stores/cart';

import { formatCurrency } from '@/utils/format';
import { RouterLink } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { placeholderImage } from '@/utils/placeholder';



const cart = useCartStore();



function imageUrl(item: (typeof cart.items)[number]) {

  return item.plant.latestImage?.url ?? placeholderImage(item.plant.qrCode, '🌵', 112);

}



async function changeQty(id: string, quantity: number) {
  if (quantity < 1) {
    await cart.remove(id);
    return;
  }
  await cart.changeQuantity(id, quantity);
}



onMounted(() => {

  cart.loadCart();

});

</script>



<template>

  <div class="cart-page">

    <h1 class="cart-title">🛒 장바구니</h1>



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

            <img :src="imageUrl(item)" alt="" loading="lazy" />

          </RouterLink>

          <div class="cart-item-body">

            <RouterLink :to="`/p/${item.plant.qrCode}`" class="cart-item-name">

              {{ item.plant.nickname ?? item.plant.species.displayName }}

            </RouterLink>

            <div class="cart-item-sub">{{ item.plant.species.displayName }}</div>

            <div class="cart-item-price">{{ formatCurrency(item.plant.sellingPrice) }}</div>

            <div class="cart-item-qty">

              <button type="button" class="qty-btn" :disabled="cart.actionLoading" @click="changeQty(item.id, item.quantity - 1)">−</button>

              <span>{{ item.quantity }}</span>

              <button type="button" class="qty-btn" :disabled="cart.actionLoading" @click="changeQty(item.id, item.quantity + 1)">+</button>

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

        <BaseButton variant="primary" disabled title="주문/문의 API는 아직 구현되지 않았습니다">문의 접수하기</BaseButton>

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



.cart-status {

  text-align: center;

  padding: 2rem 1rem;

  display: flex;

  flex-direction: column;

  gap: 0.75rem;

  align-items: center;

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

  align-items: flex-start;

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

  min-width: 0;

}



.cart-item-name {

  font-size: 0.85rem;

  font-weight: 700;

  color: #1b2420;

  text-decoration: none;

  display: block;

}



.cart-item-sub {

  font-size: 0.72rem;

  color: #6c7a72;

}



.cart-item-price {

  font-size: 0.8rem;

  color: #2d6a4f;

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

  border: 1px solid #dde5e0;

  border-radius: 6px;

  background: #fff;

  cursor: pointer;

  font-size: 0.95rem;

  line-height: 1;

}



.qty-btn:disabled {

  opacity: 0.5;

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


