<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { usePublicShowcaseStore } from '@/stores/publicShowcase';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { formatCurrency } from '@/utils/format';
import { placeholderImage } from '@/utils/placeholder';

const route = useRoute();
const router = useRouter();
const store = usePublicShowcaseStore();
const cart = useCartStore();
const auth = useAuthStore();

const searchInput = computed({
  get: () => store.filters.q,
  set: (value: string) => store.setFilter({ q: value }),
});

function syncFromRoute() {
  store.setFilter({
    categoryId: String(route.query.category ?? ''),
    speciesId: String(route.query.species ?? ''),
    q: String(route.query.q ?? ''),
    status: String(route.query.status ?? 'FOR_SALE'),
    page: 1,
  });
}

function pushQuery() {
  const query: Record<string, string> = {};
  if (store.filters.categoryId) query.category = store.filters.categoryId;
  if (store.filters.speciesId) query.species = store.filters.speciesId;
  if (store.filters.q.trim()) query.q = store.filters.q.trim();
  if (store.filters.status && store.filters.status !== 'FOR_SALE') query.status = store.filters.status;
  router.replace({ query });
}

async function applySearch() {
  pushQuery();
  await store.applyFilters();
}

async function addToCart(qrCode: string, event: Event) {
  event.preventDefault();
  event.stopPropagation();
  if (!auth.isAuthenticated) {
    await router.push({ path: '/login', query: { redirect: `/p/${qrCode}` } });
    return;
  }
  await cart.addByQrCode(qrCode);
}

function imageUrl(item: (typeof store.items)[number]) {
  return item.latestImage?.url ?? placeholderImage(item.qrCode, '🌵', 320);
}

onMounted(async () => {
  syncFromRoute();
  await store.fetchList();
});

watch(
  () => route.query,
  async () => {
    syncFromRoute();
    await store.fetchList();
  },
);
</script>

<template>
  <div class="showcase">
    <div class="showcase-header">
      <h1>🌵 판매 쇼케이스</h1>
      <p>다육식물 컬렉션 중 판매중인 개체를 둘러보세요. QR 스캔으로도 바로 확인할 수 있습니다.</p>
    </div>

    <form class="showcase-filters" @submit.prevent="applySearch">
      <input v-model="searchInput" type="search" placeholder="품종명·닉네임·QR 검색" class="showcase-search" />
      <select v-model="store.filters.categoryId" class="showcase-select" @change="applySearch">
        <option value="">전체 카테고리</option>
        <option v-for="cat in store.categoryOptions" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <BaseButton type="submit" variant="primary" size="sm">검색</BaseButton>
    </form>

    <div v-if="store.loading && store.items.length === 0" class="showcase-grid">
      <div v-for="n in 6" :key="n" class="showcase-card showcase-skeleton">
        <div class="skeleton-image" />
        <div class="skeleton-line" />
        <div class="skeleton-line short" />
      </div>
    </div>

    <div v-else-if="store.error" class="showcase-status">
      <EmptyState :message="store.error" icon="⚠️" />
      <BaseButton variant="outline" size="sm" @click="store.fetchList()">다시 시도</BaseButton>
    </div>

    <div v-else-if="store.items.length === 0" class="showcase-status">
      <EmptyState message="판매중인 개체가 없습니다." icon="🌱" />
      <p class="showcase-hint">QR 코드를 스캔하면 개체 상세(`/p/:qrCode`)로 바로 이동할 수 있습니다.</p>
    </div>

    <template v-else>
      <p class="showcase-count">총 {{ store.meta.total }}건</p>
      <div class="showcase-grid">
        <RouterLink
          v-for="item in store.items"
          :key="item.qrCode"
          :to="`/p/${item.qrCode}`"
          class="showcase-card"
        >
          <img :src="imageUrl(item)" :alt="item.species.displayName" loading="lazy" class="showcase-card-image" />
          <div class="showcase-card-body">
            <span v-if="item.species.category" class="showcase-card-category">{{ item.species.category.name }}</span>
            <h2 class="showcase-card-title">{{ item.nickname ?? item.species.displayName }}</h2>
            <p class="showcase-card-sub">{{ item.species.displayName }}</p>
            <div class="showcase-card-footer">
              <span class="showcase-card-price">{{ formatCurrency(item.sellingPrice) }}</span>
              <BaseButton
                variant="outline"
                size="sm"
                class="showcase-cart-btn"
                :disabled="cart.actionLoading || cart.isInCart(item.qrCode)"
                @click="addToCart(item.qrCode, $event)"
              >
                {{ cart.isInCart(item.qrCode) ? '담김 ✓' : '담기' }}
              </BaseButton>
            </div>
          </div>
        </RouterLink>
      </div>
      <div v-if="store.hasMore" class="showcase-more">
        <BaseButton variant="outline" :disabled="store.loading" @click="store.loadMore()">
          {{ store.loading ? '불러오는 중...' : '더 보기' }}
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.showcase {
  padding: 1rem 1.1rem 1.5rem;
}

.showcase-header h1 {
  font-size: 1.15rem;
  margin-bottom: 0.3rem;
}

.showcase-header p {
  font-size: 0.8rem;
  color: #6c7a72;
  margin-bottom: 1rem;
  line-height: 1.45;
}

.showcase-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.showcase-search,
.showcase-select {
  flex: 1 1 140px;
  padding: 0.55rem 0.7rem;
  border: 1px solid #dde5e0;
  border-radius: 8px;
  font-size: 0.85rem;
}

.showcase-count {
  font-size: 0.78rem;
  color: #6c7a72;
  margin-bottom: 0.65rem;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .showcase-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.showcase-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
}

.showcase-card-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #eef2ef;
}

.showcase-card-body {
  padding: 0.65rem 0.7rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.showcase-card-category {
  font-size: 0.68rem;
  color: #40916c;
  font-weight: 600;
}

.showcase-card-title {
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.25;
}

.showcase-card-sub {
  font-size: 0.72rem;
  color: #6c7a72;
}

.showcase-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  margin-top: auto;
  padding-top: 0.45rem;
}

.showcase-card-price {
  font-size: 0.82rem;
  font-weight: 700;
  color: #2d6a4f;
}

.showcase-cart-btn {
  flex-shrink: 0;
  padding: 0.25rem 0.45rem;
  font-size: 0.72rem;
}

.showcase-status {
  text-align: center;
  padding: 2rem 1rem;
}

.showcase-hint {
  font-size: 0.78rem;
  color: #6c7a72;
  margin-top: 0.75rem;
}

.showcase-more {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.showcase-skeleton {
  pointer-events: none;
}

.skeleton-image {
  aspect-ratio: 1;
  background: linear-gradient(90deg, #eef2ef 25%, #f6f8f7 50%, #eef2ef 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

.skeleton-line {
  height: 0.75rem;
  margin: 0.65rem 0.7rem 0;
  border-radius: 4px;
  background: #eef2ef;
}

.skeleton-line.short {
  width: 55%;
  margin-bottom: 0.75rem;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
