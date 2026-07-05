<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSpeciesStore } from '@/stores/species';
import { usePlantStore } from '@/stores/plant';
import { useAuthStore } from '@/stores/auth';
import { TAXON_RANK_LABEL, type Species } from '@/types/species';
import PageHeader from '@/components/common/PageHeader.vue';
import FilterBar from '@/components/common/FilterBar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import TableRowActions from '@/components/common/TableRowActions.vue';
import SpeciesFormModal from './SpeciesFormModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseAutocomplete from '@/components/base/BaseAutocomplete.vue';

const store = useSpeciesStore();
const plantStore = usePlantStore();
const auth = useAuthStore();
const router = useRouter();

const canManage = () => auth.hasRole('ADMIN', 'STAFF');

const localSearch = ref('');

const categoryFilterOptions = computed(() =>
  store.categoryOptions.map((c) => ({ value: c.code, label: c.name, keywords: c.code })),
);

onMounted(() => {
  store.fetchSpecies();
  plantStore.ensurePlantsLoaded();
  localSearch.value = store.searchQuery;
});

const showForm = ref(false);
const editingSpecies = ref<Species | null>(null);

function applySearch() {
  store.setSearch(localSearch.value.trim());
}

function openCreate() {
  editingSpecies.value = null;
  showForm.value = true;
}

function openEdit(species: Species, event?: Event) {
  event?.stopPropagation();
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

function goDetail(species: Species) {
  router.push(`/admin/species/${species.id}`);
}

async function handleDelete(species: Species, event: Event) {
  event.stopPropagation();
  if (!confirm(`'${species.displayName}' 품종을 삭제하시겠습니까?\n(보유 개체가 있는 경우 비활성화만 되며 데이터는 유지됩니다)`)) return;
  await store.deleteSpecies(species.id);
}
</script>

<template>
  <div>
    <PageHeader title="품종관리" subtitle="Species는 유통명(displayName) 중심으로 관리됩니다.">
      <template #actions>
        <BaseButton v-if="canManage()" variant="primary" @click="openCreate">등록</BaseButton>
      </template>
    </PageHeader>

    <p v-if="store.deleteError" class="form-error form-error--block">{{ store.deleteError }}</p>

    <FilterBar
      v-model:search-query="localSearch"
      search-placeholder="유통명, 학명, 영문명, 국문명, 필드넘버, 판매자명 검색"
      @search="applySearch"
    >
      <template #filters>
        <BaseAutocomplete
          :model-value="store.categoryFilter"
          variant="filter"
          :options="categoryFilterOptions"
          nullable
          empty-label="전체 카테고리"
          placeholder="카테고리"
          min-width="140px"
          @update:model-value="store.setCategoryFilter"
        />
      </template>
      <template #meta>
        <span>총 {{ store.filtered.length }}건</span>
      </template>
    </FilterBar>

    <div class="panel">
      <div v-if="store.listLoading" class="table-empty">
        <EmptyState message="품종 목록을 불러오는 중입니다..." icon="⏳" />
      </div>
      <div v-else-if="store.listError" class="table-empty">
        <EmptyState :message="store.listError" icon="⚠️" />
        <div class="table-empty-actions"><BaseButton variant="outline" size="sm" @click="store.fetchSpecies">다시 시도</BaseButton></div>
      </div>
      <div v-else-if="store.filtered.length === 0" class="table-empty">
        <EmptyState message="조건에 맞는 품종이 없습니다." icon="🌱" />
      </div>
      <BaseTable v-else>
        <thead>
          <tr>
            <th>유통명</th>
            <th>학명</th>
            <th>카테고리</th>
            <th>분류등급</th>
            <th>보유 개체</th>
            <th v-if="canManage()" class="col-actions">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in store.filtered" :key="s.id" class="clickable" @click="goDetail(s)">
            <td>{{ s.displayName }}</td>
            <td class="cell-sci">{{ s.scientificName ?? '학명 미상' }}</td>
            <td>{{ s.category?.name ?? '미분류' }}</td>
            <td>{{ TAXON_RANK_LABEL[s.taxonRank] }}</td>
            <td>{{ s.plantCount }}개</td>
            <td v-if="canManage()" class="col-actions" @click.stop>
              <TableRowActions
                :delete-loading="store.deleteLoadingId === s.id"
                @edit="openEdit(s, $event)"
                @delete="handleDelete(s, $event)"
              />
            </td>
          </tr>
        </tbody>
      </BaseTable>
    </div>

    <SpeciesFormModal v-if="showForm" :species="editingSpecies" @close="closeForm" @saved="handleSaved" />
  </div>
</template>

<style scoped>
.cell-sci {
  font-style: italic;
  color: var(--color-text-muted);
  font-size: 0.84rem;
}

.table-empty {
  padding: 1rem 0;
}

.table-empty-actions {
  display: flex;
  justify-content: center;
  margin-top: -1rem;
}
</style>
