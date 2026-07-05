<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useCartStore } from '@/stores/cart';
import { usePublicCartStore } from '@/stores/publicCart';
import { useAuthStore } from '@/stores/auth';

const cart = useCartStore();
const publicCart = usePublicCartStore();
const auth = useAuthStore();

const badgeCount = computed(() => (auth.isAuthenticated ? cart.badgeCount : publicCart.badgeCount));

onMounted(() => {
  if (auth.isAuthenticated) cart.loadCart();
});

watch(
  () => auth.isAuthenticated,
  (loggedIn) => {
    if (loggedIn) cart.loadCart();
    else cart.reset();
  },
);
</script>

<template>
  <div class="public-layout">
    <header class="public-header">
      <RouterLink to="/p" class="public-logo">🌿 Ask Plant</RouterLink>
      <RouterLink to="/cart" class="public-cart-link">
        🛒
        <span v-if="badgeCount > 0" class="public-cart-count">{{ badgeCount }}</span>
      </RouterLink>
    </header>

    <Transition name="toast">
      <div v-if="cart.toast" class="public-toast" :class="`public-toast-${cart.toast.type}`" @click="cart.clearToast()">
        {{ cart.toast.message }}
      </div>
    </Transition>

    <main class="public-content">
      <RouterView />
    </main>
    <footer class="public-footer">Ask Plant · 다육식물 컬렉션 관리 시스템</footer>
  </div>
</template>

<style scoped>
.public-toast {
  position: fixed;
  bottom: 4.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  max-width: calc(100vw - 2rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.public-toast-success {
  background: #d8f3dc;
  color: #1b7a3d;
}

.public-toast-error {
  background: #fdecea;
  color: #c62828;
}

.public-toast-info {
  background: #eef2ef;
  color: #1b2420;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
