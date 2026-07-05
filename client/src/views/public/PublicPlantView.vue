<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePublicPlantStore } from '@/stores/publicPlant';
import { useCartStore } from '@/stores/cart';
import { usePublicCartStore } from '@/stores/publicCart';
import { useAuthStore } from '@/stores/auth';
import ImageGallery from '@/components/common/ImageGallery.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { formatCurrency } from '@/utils/format';
import { statusTone } from '@/utils/badge';

const route = useRoute();
const store = usePublicPlantStore();
const cart = useCartStore();
const publicCart = usePublicCartStore();
const auth = useAuthStore();

const inquirySent = ref(false);

const inCart = computed(() => {
  if (!store.plant) return false;
  return auth.isAuthenticated ? cart.isInCart(store.plant.qrCode) : publicCart.isInCart(store.plant.qrCode);
});

function load() {
  store.fetchByQrCode(String(route.params.qrCode));
}

function addToCart() {
  if (!store.plant || store.plant.sellingPrice == null) return;
  if (auth.isAuthenticated) {
    void cart.addByQrCode(store.plant.qrCode);
    return;
  }
  publicCart.addItem({
    qrCode: store.plant.qrCode,
    displayName: store.plant.nickname ?? store.plant.species.displayName,
    imageUrl: store.plant.latestImage?.url ?? null,
    priceSnapshot: store.plant.sellingPrice,
  });
}

function sendInquiry() {
  inquirySent.value = true;
  setTimeout(() => (inquirySent.value = false), 3000);
}

onMounted(() => {
  load();
  if (auth.isAuthenticated) void cart.loadCart();
});
watch(() => route.params.qrCode, load);
</script>

<template>
  <div v-if="store.loading" class="public-status-panel">
    <EmptyState message="식물 정보를 불러오는 중입니다..." icon="⏳" />
  </div>

  <div v-else-if="store.error" class="public-status-panel">
    <EmptyState :message="store.error" icon="⚠️" />
    <div class="public-status-actions"><BaseButton variant="outline" size="sm" @click="load">다시 시도</BaseButton></div>
  </div>

  <div v-else-if="store.notFound" class="public-not-found">
    <p style="font-size: 2rem">🔍</p>
    <p>해당 QR코드의 식물 정보를 찾을 수 없습니다.</p>
    <p class="public-not-found-hint">QR 코드가 올바른지 확인하거나, 판매 종료·폐기된 개체일 수 있습니다.</p>
    <BaseButton variant="outline" to="/p" class="public-not-found-btn">둘러보기로 이동</BaseButton>
  </div>

  <div v-else-if="store.plant">
    <ImageGallery v-if="store.galleryImages.length > 0" :images="store.galleryImages" variant="public" />
    <div v-else class="public-image-fallback">
      <EmptyState message="등록된 사진이 없습니다." icon="🖼️" />
    </div>

    <div class="public-body">
      <span class="public-category-badge">{{ store.plant.species.displayName }}</span>
      <h1 class="public-title">{{ store.displayTitle }}</h1>
      <p class="public-subtitle">{{ store.displaySubtitle }}</p>

      <div class="public-price">{{ formatCurrency(store.plant.sellingPrice) }}</div>

      <div class="public-info-list">
        <div class="public-info-row">
          <span class="public-info-label">유통명</span>
          <span class="public-info-value">{{ store.plant.species.displayName }}</span>
        </div>
        <div class="public-info-row">
          <span class="public-info-label">상태</span>
          <span class="public-status-pill" :class="`badge-${statusTone(store.plant.status.code)}`">{{ store.plant.status.name }}</span>
        </div>
        <div class="public-info-row">
          <span class="public-info-label">위치</span>
          <span class="public-info-value">{{ store.plant.location?.name ?? '문의 요망' }}</span>
        </div>
        <div class="public-info-row">
          <span class="public-info-label">QR코드</span>
          <span class="public-info-value">{{ store.plant.qrCode }}</span>
        </div>
      </div>

      <div v-if="store.plant.latestHistory" class="public-latest-history">
        <h2 class="public-section-title">최근 관리 이력</h2>
        <p class="public-history-type">{{ store.plant.latestHistory.historyType.name }}</p>
        <p v-if="store.plant.latestHistory.title" class="public-history-title">{{ store.plant.latestHistory.title }}</p>
        <p class="public-history-date">{{ new Date(store.plant.latestHistory.performedAt).toLocaleDateString('ko-KR') }}</p>
      </div>

      <p v-if="inquirySent" class="public-inquiry-toast">문의가 접수되었습니다. 곧 연락드리겠습니다.</p>
    </div>

    <div class="public-cta-bar">
      <BaseButton variant="outline" @click="sendInquiry">문의하기</BaseButton>
      <BaseButton variant="primary" :disabled="!store.canOrder || inCart" @click="addToCart">
        {{ inCart ? '담김 ✓' : store.canOrder ? '장바구니 담기' : '판매중 아님' }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.public-status-panel {
  padding: 2rem 1rem;
}

.public-status-actions {
  display: flex;
  justify-content: center;
  margin-top: -0.5rem;
}

.public-image-fallback {
  padding: 2rem 1rem;
  background: var(--color-surface, #fff);
}

.public-not-found-hint {
  font-size: 0.82rem;
  color: var(--color-text-muted, #6c7a72);
  margin-top: 0.35rem;
}

.public-not-found-btn {
  margin-top: 1rem;
  display: inline-flex;
}

.public-inquiry-toast {
  background: #d8f3dc;
  color: #1b7a3d;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.public-latest-history {
  margin-top: 1.25rem;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  background: var(--color-bg, #f6f8f7);
}

.public-section-title {
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.public-history-type {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary, #40916c);
}

.public-history-title {
  font-size: 0.82rem;
  margin-top: 0.2rem;
}

.public-history-date {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6c7a72);
  margin-top: 0.25rem;
}
</style>
