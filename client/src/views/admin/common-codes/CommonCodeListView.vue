<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCommonCodeStore } from '@/stores/common-code';
import { useUiStore } from '@/stores/ui';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const store = useCommonCodeStore();
const ui = useUiStore();

const searchInput = ref('');
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function onSearchInput(value: string) {
  searchInput.value = value;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    store.setSearchKeyword(value);
  }, 300);
}

onMounted(() => {
  ui.setBreadcrumbExtra(null);
  store.fetchCodes();
});
</script>

<template>
  <div>
    <PageHeader title="공통코드" subtitle="시스템 전반에서 사용되는 그룹별 코드값을 관리합니다.">
      <template #actions>
        <button type="button" class="btn btn-primary" disabled title="조회 전용 API만 구현되어 있어 아직 비활성화됩니다">
          + 코드 추가
        </button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <input
        type="text"
        placeholder="그룹코드, 코드, 명칭으로 검색"
        :value="searchInput"
        @input="onSearchInput(($event.target as HTMLInputElement).value)"
      />
      <span class="filter-total">그룹 {{ store.filteredGroupSummaries.length }}개 · 코드 {{ store.filteredCodes.length }}건</span>
    </div>

    <div v-if="store.loading" class="panel">
      <EmptyState message="공통코드를 불러오는 중입니다..." icon="⏳" />
    </div>

    <div v-else-if="store.error" class="panel">
      <EmptyState :message="store.error" icon="⚠️" />
      <div class="table-empty-actions"><button type="button" class="btn btn-outline btn-sm" @click="store.fetchCodes">다시 시도</button></div>
    </div>

    <div v-else class="cc-layout">
      <!-- 좌측: 상위 그룹 Grid -->
      <section class="panel cc-group-panel">
        <h2 class="cc-panel-title">그룹</h2>

        <div v-if="store.filteredGroupSummaries.length === 0" class="table-empty">
          <EmptyState message="검색 조건에 맞는 그룹이 없습니다." icon="🔍" />
        </div>
        <div v-else class="cc-group-grid">
          <button
            v-for="group in store.filteredGroupSummaries"
            :key="group.groupCode"
            type="button"
            class="cc-group-tile"
            :class="{ active: group.groupCode === store.selectedGroupCode }"
            @click="store.selectGroup(group.groupCode)"
          >
            <span class="cc-group-tile-label">{{ group.label }}</span>
            <code class="cc-group-tile-code">{{ group.groupCode }}</code>
            <span class="cc-group-tile-count">{{ group.activeCount }}/{{ group.totalCount }}건</span>
          </button>
        </div>
      </section>

      <!-- 우측: 하위 코드 Grid -->
      <section class="panel cc-code-panel">
        <h2 class="cc-panel-title">
          {{ store.selectedGroupCode ? (store.groupSummaries.find((g) => g.groupCode === store.selectedGroupCode)?.label ?? store.selectedGroupCode) : '코드' }}
          <code v-if="store.selectedGroupCode" class="cc-panel-title-code">{{ store.selectedGroupCode }}</code>
        </h2>

        <div v-if="!store.selectedGroupCode" class="table-empty">
          <EmptyState message="좌측에서 그룹을 선택해주세요." icon="👈" />
        </div>
        <div v-else-if="store.filteredCodes.length === 0" class="table-empty">
          <EmptyState message="No Data — 조건에 맞는 코드가 없습니다." icon="🗂️" />
        </div>
        <div v-else class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>순서</th>
                <th>코드</th>
                <th>명칭</th>
                <th>설명</th>
                <th>사용여부</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in store.filteredCodes" :key="c.id">
                <td>{{ c.sortOrder }}</td>
                <td><code>{{ c.code }}</code></td>
                <td>{{ c.name }}</td>
                <td class="cc-desc-cell">{{ c.description ?? '-' }}</td>
                <td>
                  <span class="badge" :class="c.isActive === false ? 'badge-gray' : 'badge-green'">
                    {{ c.isActive === false ? '미사용' : '사용' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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

.cc-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 860px) {
  .cc-layout {
    grid-template-columns: 1fr;
  }
}

.cc-panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.9rem;
}

.cc-panel-title-code {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.cc-group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.6rem;
}

.cc-group-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.cc-group-tile:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-lighter);
}

.cc-group-tile.active {
  border-color: var(--color-primary);
  background: var(--color-primary-lighter);
}

.cc-group-tile-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
}

.cc-group-tile-code {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.cc-group-tile-count {
  font-size: 0.72rem;
  color: var(--color-primary);
  font-weight: 600;
}

.cc-desc-cell {
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
