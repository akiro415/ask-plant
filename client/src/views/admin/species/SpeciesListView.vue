<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useSpeciesStore } from '@/stores/species';
import { usePlantStore } from '@/stores/plant';
import { useAuthStore } from '@/stores/auth';
import { TAXON_RANK_LABEL, type Species } from '@/types/species';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SpeciesFormModal from './SpeciesFormModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const store = useSpeciesStore();
const plantStore = usePlantStore();
const auth = useAuthStore();

const canManage = () => auth.hasRole('ADMIN', 'STAFF');

onMounted(() => {
  store.fetchSpecies();
  // 카드별 "보유 개체" 수 계산에 필요 — 목록 화면을 거치지 않고 바로 진입해도 값이 채워지도록 최초 1회 로드를 보장한다.
  plantStore.ensurePlantsLoaded();
});

const showForm = ref(false);
const editingSpecies = ref<Species | null>(null);

function openCreate() {
  editingSpecies.value = null;
  showForm.value = true;
}

function openEdit(species: Species) {
  editingSpecies.value = species;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingSpecies.value = null;
}

function handleSaved() {
  closeForm();
}

async function handleDelete(species: Species) {
  if (!confirm(`'${species.displayName}' 품종을 삭제하시겠습니까?\n(보유 개체가 있는 경우 비활성화만 되며 데이터는 유지됩니다)`)) return;
  await store.deleteSpecies(species.id);
}
</script>

<template>
  <div>
    <PageHeader title="품종관리" subtitle="Species는 유통명(displayName) 중심으로 관리됩니다.">
      <template #actions>
        <BaseButton v-if="canManage()" variant="primary" @click="openCreate">+ 품종 등록</BaseButton>
      </template>
    </PageHeader>

    <p v-if="store.deleteError" class="form-error form-error--block">{{ store.deleteError }}</p>

    <div class="filter-bar">
      <input
        type="text"
        placeholder="유통명, 학명, 영문명, 국문명, 필드넘버, 판매자명 검색"
        :value="store.searchQuery"
        @input="store.setSearch(($event.target as HTMLInputElement).value)"
      />
      <select :value="store.categoryFilter" @change="store.setCategoryFilter(($event.target as HTMLSelectElement).value)">
        <option value="">전체 카테고리</option>
        <option v-for="c in store.categoryOptions" :key="c.code" :value="c.code">{{ c.name }}</option>
      </select>
      <span class="filter-total">총 {{ store.filtered.length }}건</span>
    </div>

    <div v-if="store.listLoading" class="panel">
      <EmptyState message="품종 목록을 불러오는 중입니다..." icon="⏳" />
    </div>
    <div v-else-if="store.listError" class="panel">
      <EmptyState :message="store.listError" icon="⚠️" />
      <div class="table-empty-actions"><BaseButton variant="outline" size="sm" @click="store.fetchSpecies">다시 시도</BaseButton></div>
    </div>
    <div v-else-if="store.filtered.length === 0" class="panel">
      <EmptyState message="조건에 맞는 품종이 없습니다." icon="🌱" />
    </div>
    <div v-else class="species-grid">
      <RouterLink v-for="s in store.filtered" :key="s.id" :to="`/admin/species/${s.id}`" class="species-card">
        <img v-if="s.thumbnailUrl" :src="s.thumbnailUrl" alt="" class="species-thumb" />
        <div v-else class="species-thumb species-thumb-placeholder">🌱</div>
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
        <div v-if="canManage()" class="species-card-actions">
          <BaseButton variant="outline" size="sm" @click.stop.prevent="openEdit(s)">수정</BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            destructive
            :disabled="store.deleteLoadingId === s.id"
            @click.stop.prevent="handleDelete(s)"
          >
            {{ store.deleteLoadingId === s.id ? '삭제 중...' : '삭제' }}
          </BaseButton>
        </div>
      </RouterLink>
    </div>

    <SpeciesFormModal v-if="showForm" :species="editingSpecies" @close="closeForm" @saved="handleSaved" />
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

.species-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  background: var(--color-bg);
}

.table-empty-actions {
  display: flex;
  justify-content: center;
  margin-top: -0.5rem;
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

.species-card-actions {
  display: flex;
  gap: 0.4rem;
  padding: 0 1rem 0.9rem;
}

</style>
