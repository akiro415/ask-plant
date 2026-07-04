<script setup lang="ts">
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();
</script>

<template>
  <div class="public-layout">
    <header class="public-header">
      <RouterLink to="/" class="public-logo">🌿 Ask Plant</RouterLink>
      <RouterLink to="/cart" class="public-cart-link">
        🛒
        <span v-if="cart.totalCount > 0" class="public-cart-count">{{ cart.totalCount }}</span>
      </RouterLink>
    </header>
    <main class="public-content">
      <RouterView />
    </main>
    <footer class="public-footer">Ask Plant · 다육식물 컬렉션 관리 시스템</footer>
  </div>
</template>
