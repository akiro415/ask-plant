<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlantStore } from '@/stores/plant';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import PageHeader from '@/components/common/PageHeader.vue';
import FilterBar from '@/components/common/FilterBar.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import Pagination from '@/components/common/Pagination.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseAutocomplete from '@/components/base/BaseAutocomplete.vue';
import { formatCurrency, formatDate } from '@/utils/format';

const store = usePlantStore();
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const ui = useUiStore();

const localSearch = ref('');
const localOwnerSearch = ref('');
const showOwnerColumn = auth.hasRole('ADMIN', 'STAFF');

const statusFilterOptions = computed(() =>
  store.statusOptions.map((s) => ({ value: s.code, label: s.name, keywords: s.code })),
);

const categoryFilterOptions = computed(() =>
  store.categoryOptions.map((c) => ({ value: c.code, label: c.name, keywords: c.code })),
);

onMounted(() => {
  ui.setBreadcrumbExtra(null);
  const statusFromQuery = typeof route.query.status === 'string' ? route.query.status : '';
  if (statusFromQuery) store.statusFilter = statusFromQuery;
  store.fetchPlants();
  store.ensureFilterOptionsLoaded();
  localSearch.value = store.searchQuery;
  localOwnerSearch.value = store.ownerSearchQuery;
});

function applySearch() {
  store.setSearch(localSearch.value.trim());
}

function applyOwnerSearch() {
  store.setOwnerSearch(localOwnerSearch.value.trim());
}

function goDetail(id: string) {
  router.push(`/admin/plants/${id}`);
}

function goCreate() {
  router.push('/admin/plants/new');
}
</script>

<template>
  <div>
    <PageHeader title="개체관리" subtitle="QR로 식별되는 개별 다육 개체를 관리합니다.">
      <template #actions>
        <BaseButton variant="primary" @click="goCreate">등록</BaseButton>
      </template>
    </PageHeader>

    <FilterBar
      v-model:search-query="localSearch"
      search-placeholder="QR코드, 닉네임, 품종명으로 검색"
      @search="applySearch"
    >
      <template #filters>
        <input
          v-if="showOwnerColumn"
          v-model="localOwnerSearch"
          type="search"
          placeholder="소유자 검색"
          @keydown.enter="applyOwnerSearch"
        />
        <BaseAutocomplete
          :model-value="store.statusFilter"
          variant="filter"
          :options="statusFilterOptions"
          nullable
          empty-label="전체 상태"
          placeholder="상태"
          min-width="130px"
          @update:model-value="store.setStatusFilter"
        />
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
        <span>총 {{ store.total }}건</span>
      </template>
    </FilterBar>

    <div class="panel">
      <div v-if="store.listLoading" class="table-empty">
        <EmptyState message="개체 목록을 불러오는 중입니다..." icon="⏳" />
      </div>
      <div v-else-if="store.listError" class="table-empty">
        <EmptyState :message="store.listError" icon="⚠️" />
        <div class="table-empty-actions"><BaseButton variant="outline" size="sm" @click="store.fetchPlants">다시 시도</BaseButton></div>
      </div>
      <div v-else-if="store.pagedPlants.length === 0" class="table-empty">
        <EmptyState message="조건에 맞는 개체가 없습니다." icon="🪴" />
      </div>
      <div v-else class="table-scroll">
        <BaseTable>
          <thead>
            <tr>
              <th>사진</th>
              <th>QR코드</th>
              <th>품종</th>
              <th>닉네임</th>
              <th v-if="showOwnerColumn">소유자</th>
              <th>위치</th>
              <th>상태</th>
              <th>기원</th>
              <th>꽃색</th>
              <th>구매두수</th>
              <th>구매단가</th>
              <th>현재두수</th>
              <th>판매단가</th>
              <th>판매총액</th>
              <th>구매처</th>
              <th>구매농장</th>
              <th>판매가</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plant in store.pagedPlants" :key="plant.id" class="clickable" @click="goDetail(plant.id)">
              <td><img :src="plant.primaryImageUrl" alt="" class="row-thumb" /></td>
              <td><code>{{ plant.qrCode }}</code></td>
              <td>
                <div class="cell-species-name">{{ plant.species.displayName }}</div>
                <div class="cell-species-sci">{{ plant.species.scientificName ?? '학명 미상' }}</div>
              </td>
              <td>{{ plant.nickname ?? '-' }}</td>
              <td v-if="showOwnerColumn">
                <div>{{ plant.owner?.name ?? '-' }}</div>
                <div class="cell-species-sci">{{ plant.owner?.email ?? '' }}</div>
              </td>
              <td>{{ plant.location?.name ?? '-' }}</td>
              <td><StatusBadge :code="plant.status.code" :label="plant.status.name" /></td>
              <td>{{ plant.originType.name }}</td>
              <td>{{ plant.flowerColor ?? '-' }}</td>
              <td>{{ plant.purchaseHeadCount ?? '-' }}</td>
              <td>{{ formatCurrency(plant.purchaseUnitPrice) }}</td>
              <td>{{ plant.currentHeadCount ?? '-' }}</td>
              <td>{{ formatCurrency(plant.unitSellingPrice) }}</td>
              <td>{{ formatCurrency(plant.totalSellingPrice) }}</td>
              <td>{{ plant.purchaseVendor ?? '-' }}</td>
              <td>{{ plant.purchaseFarm ?? '-' }}</td>
              <td>{{ formatCurrency(plant.sellingPrice) }}</td>
              <td>{{ formatDate(plant.createdAt) }}</td>
            </tr>
          </tbody>
        </BaseTable>
      </div>

      <Pagination
        v-if="!store.listLoading && !store.listError && store.pagedPlants.length > 0"
        :page="store.page"
        :total-pages="store.totalPages"
        @update:page="store.setPage"
      />
    </div>
  </div>
</template>

<style scoped>
.table-scroll {
  overflow-x: auto;
}

.row-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
}

.cell-species-name {
  font-weight: 600;
  color: var(--color-text);
}

.cell-species-sci {
  font-size: 0.74rem;
  color: var(--color-text-muted);
  font-style: italic;
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
