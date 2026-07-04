<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useSpeciesStore } from '@/stores/species';
import { mockCategories } from '@/mock';
import { TAXON_RANK_LABEL } from '@/types/species';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const store = useSpeciesStore();
</script>

<template>
  <div>
    <PageHeader title="품종관리" subtitle="Species는 유통명(displayName) 중심으로 관리됩니다.">
      <template #actions>
        <button type="button" class="btn btn-primary" disabled title="Mock 화면에서는 비활성화됩니다">+ 품종 등록</button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <input
        type="text"
        placeholder="유통명, 학명, 영문명, 국문명, 필드넘버, 판매자명 검색"
        :value="store.searchQuery"
        @input="store.setSearch(($event.target as HTMLInputElement).value)"
      />
      <select :value="store.categoryFilter" @change="store.setCategoryFilter(($event.target as HTMLSelectElement).value)">
        <option value="">전체 카테고리</option>
        <option v-for="c in mockCategories" :key="c.code" :value="c.code">{{ c.name }}</option>
      </select>
      <span class="filter-total">총 {{ store.filtered.length }}건</span>
    </div>

    <div v-if="store.filtered.length === 0" class="panel">
      <EmptyState message="조건에 맞는 품종이 없습니다." icon="🌱" />
    </div>
    <div v-else class="species-grid">
      <RouterLink v-for="s in store.filtered" :key="s.id" :to="`/admin/species/${s.id}`" class="species-card">
        <img :src="s.thumbnailUrl" alt="" class="species-thumb" />
        <div class="species-card-body">
          <div class="species-card-top">
            <span class="badge badge-green">{{ s.category?.name ?? '미분류' }}</span>
            <span class="badge badge-gray">{{ TAXON_RANK_LABEL[s.taxonRank] }}</span>
          </div>
          <div class="species-name">{{ s.displayName }}</div>
          <div class="species-sci">{{ s.scientificName ?? '학명 미상' }}</div>
          <div class="species-meta">
            <span v-if="s.fieldNumber">필드넘버 {{ s.fieldNumber }}</span>
            <span v-if="s.sellerName">{{ s.sellerName }}</span>
          </div>
          <div class="species-count">보유 개체 {{ s.plantCount }}개</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.filter-total {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.species-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.species-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.15s, transform 0.15s;
}

.species-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  text-decoration: none;
}

.species-thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.species-card-body {
  padding: 0.9rem 1rem;
}

.species-card-top {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.species-name {
  font-weight: 700;
  color: var(--color-text);
  font-size: 0.95rem;
}

.species-sci {
  font-size: 0.78rem;
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
}

.species-meta {
  display: flex;
  gap: 0.6rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
}

.species-count {
  font-size: 0.78rem;
  color: var(--color-primary);
  font-weight: 600;
}
</style>
