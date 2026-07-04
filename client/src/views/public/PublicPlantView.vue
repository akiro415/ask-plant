<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { getPlantByQrCode } from '@/mock';
import { useCartStore } from '@/stores/cart';
import ImageGallery from '@/components/common/ImageGallery.vue';
import { formatCurrency } from '@/utils/format';
import { statusTone } from '@/utils/badge';

const route = useRoute();
const cart = useCartStore();

const plant = computed(() => getPlantByQrCode(String(route.params.qrCode)));
const publicImages = computed(() => plant.value?.images.filter((img) => img.imageType !== 'OTHER') ?? []);
const inCart = computed(() => (plant.value ? cart.isInCart(plant.value.id) : false));
const canOrder = computed(() => plant.value?.status.code === 'FOR_SALE');

const inquirySent = ref(false);

function addToCart() {
  if (plant.value) cart.add(plant.value);
}

function sendInquiry() {
  inquirySent.value = true;
  setTimeout(() => (inquirySent.value = false), 3000);
}
</script>

<template>
  <div v-if="plant">
    <ImageGallery :images="publicImages" variant="public" />

    <div class="public-body">
      <span class="public-category-badge">{{ plant.species.category?.name ?? '다육식물' }}</span>
      <h1 class="public-title">{{ plant.nickname ?? plant.species.displayName }}</h1>
      <p class="public-subtitle">
        {{ plant.species.scientificName ?? plant.species.koreanName ?? plant.species.displayName }}
      </p>

      <div class="public-price">{{ formatCurrency(plant.sellingPrice) }}</div>

      <div class="public-info-list">
        <div class="public-info-row">
          <span class="public-info-label">유통명</span>
          <span class="public-info-value">{{ plant.species.displayName }}</span>
        </div>
        <div class="public-info-row">
          <span class="public-info-label">상태</span>
          <span class="public-status-pill" :class="`badge-${statusTone(plant.status.code)}`">{{ plant.status.name }}</span>
        </div>
        <div class="public-info-row">
          <span class="public-info-label">위치</span>
          <span class="public-info-value">{{ plant.location?.name ?? '문의 요망' }}</span>
        </div>
        <div class="public-info-row">
          <span class="public-info-label">QR코드</span>
          <span class="public-info-value">{{ plant.qrCode }}</span>
        </div>
      </div>

      <p v-if="inquirySent" class="public-inquiry-toast">문의가 접수되었습니다. (Mock) 곧 연락드리겠습니다.</p>
    </div>

    <div class="public-cta-bar">
      <button type="button" class="btn btn-outline" @click="sendInquiry">문의하기</button>
      <button type="button" class="btn btn-primary" :disabled="!canOrder || inCart" @click="addToCart">
        {{ inCart ? '담김 ✓' : canOrder ? '장바구니 담기' : '판매중 아님' }}
      </button>
    </div>
  </div>

  <div v-else class="public-not-found">
    <p style="font-size: 2rem">🔍</p>
    <p>해당 QR코드의 식물 정보를 찾을 수 없습니다.</p>
    <RouterLink to="/p" class="btn btn-outline" style="margin-top: 1rem; display: inline-flex">둘러보기로 이동</RouterLink>
  </div>
</template>

<style scoped>
.public-inquiry-toast {
  background: #d8f3dc;
  color: #1b7a3d;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}
</style>
