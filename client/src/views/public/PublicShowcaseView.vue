<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { mockPlantSummaries } from '@/mock';
import { formatCurrency } from '@/utils/format';

const forSale = computed(() => mockPlantSummaries.filter((p) => p.status.code === 'FOR_SALE').slice(0, 20));
</script>

<template>
  <div class="showcase">
    <div class="showcase-header">
      <h1>🌵 판매중인 다육식물</h1>
      <p>QR 스캔 없이 미리보기용으로 모바일 공개 화면을 둘러볼 수 있습니다. (Mock)</p>
    </div>
    <div class="showcase-grid">
      <RouterLink v-for="p in forSale" :key="p.id" :to="`/p/${p.qrCode}`" class="showcase-card">
        <img :src="p.primaryImageUrl" alt="" />
        <div class="showcase-card-body">
          <div class="showcase-name">{{ p.nickname ?? p.species.displayName }}</div>
          <div class="showcase-price">{{ formatCurrency(p.sellingPrice) }}</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.showcase {
  padding: 1rem 1.1rem;
}

.showcase-header h1 {
  font-size: 1.15rem;
  margin-bottom: 0.3rem;
}

.showcase-header p {
  font-size: 0.8rem;
  color: #6c7a72;
  margin-bottom: 1rem;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.showcase-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.showcase-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.showcase-card-body {
  padding: 0.6rem 0.7rem;
}

.showcase-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1b2420;
  margin-bottom: 0.2rem;
}

.showcase-price {
  font-size: 0.8rem;
  font-weight: 700;
  color: #2d6a4f;
}
</style>
