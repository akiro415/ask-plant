<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCommonCodeStore } from '@/stores/common-code';
import { useUiStore } from '@/stores/ui';
import type { CommonCode } from '@/types/common';
import PageHeader from '@/components/common/PageHeader.vue';
import FilterBar from '@/components/common/FilterBar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import TableRowActions from '@/components/common/TableRowActions.vue';
import CommonCodeFormModal from './CommonCodeFormModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';

const store = useCommonCodeStore();
const ui = useUiStore();

const localSearch = ref('');
const showForm = ref(false);
const editingCode = ref<CommonCode | null>(null);

function applySearch() {
  store.setSearchKeyword(localSearch.value.trim());
}

function openCreate() {
  editingCode.value = null;
  showForm.value = true;
}

function openEdit(code: CommonCode, event?: Event) {
  event?.stopPropagation();
  editingCode.value = code;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingCode.value = null;
}

function handleSaved() {
  closeForm();
}

function selectGroup(groupCode: string) {
  store.selectGroup(groupCode);
}

async function handleDelete(code: CommonCode, event: Event) {
  event.stopPropagation();
  if (!confirm(`'${code.name}' (${code.code}) 코드를 삭제(비활성화)하시겠습니까?`)) return;
  await store.deleteCode(code.id);
}

onMounted(() => {
  ui.setBreadcrumbExtra(null);
  store.fetchCodes();
  localSearch.value = store.searchKeyword;
});
</script>

<template>
  <div>
    <PageHeader title="공통코드" subtitle="시스템 전반에서 사용되는 그룹별 코드값을 관리합니다.">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate">코드 등록</BaseButton>
      </template>
    </PageHeader>

    <FilterBar
      v-model:search-query="localSearch"
      search-placeholder="그룹코드, 코드, 명칭으로 검색"
      @search="applySearch"
    >
      <template #meta>
        <span>그룹 {{ store.filteredGroupSummaries.length }}개 · 코드 {{ store.filteredCodes.length }}건</span>
      </template>
    </FilterBar>

    <p v-if="store.deleteError" class="form-error form-error--block">{{ store.deleteError }}</p>

    <div v-if="store.loading" class="panel">
      <EmptyState message="공통코드를 불러오는 중입니다..." icon="⏳" />
    </div>

    <div v-else-if="store.error" class="panel">
      <EmptyState :message="store.error" icon="⚠️" />
      <div class="table-empty-actions"><BaseButton variant="outline" size="sm" @click="store.fetchCodes">다시 시도</BaseButton></div>
    </div>

    <template v-else>
      <section class="panel">
        <h2 class="cc-panel-title">그룹</h2>
        <div v-if="store.filteredGroupSummaries.length === 0" class="table-empty">
          <EmptyState message="검색 조건에 맞는 그룹이 없습니다." icon="🔍" />
        </div>
        <BaseTable v-else>
          <thead>
            <tr>
              <th>그룹명</th>
              <th>그룹코드</th>
              <th>코드 수</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="group in store.filteredGroupSummaries"
              :key="group.groupCode"
              class="clickable"
              :class="{ selected: group.groupCode === store.selectedGroupCode }"
              @click="selectGroup(group.groupCode)"
            >
              <td>{{ group.label }}</td>
              <td><code>{{ group.groupCode }}</code></td>
              <td>{{ group.activeCount }}/{{ group.totalCount }}건</td>
            </tr>
          </tbody>
        </BaseTable>
      </section>

      <section class="panel cc-code-panel">
        <h2 class="cc-panel-title">
          {{ store.selectedGroupCode ? (store.groupSummaries.find((g) => g.groupCode === store.selectedGroupCode)?.label ?? store.selectedGroupCode) : '코드' }}
          <code v-if="store.selectedGroupCode" class="cc-panel-title-code">{{ store.selectedGroupCode }}</code>
        </h2>

        <div v-if="!store.selectedGroupCode" class="table-empty">
          <EmptyState message="위에서 그룹을 선택해주세요." icon="👆" />
        </div>
        <div v-else-if="store.filteredCodes.length === 0" class="table-empty">
          <EmptyState message="조건에 맞는 코드가 없습니다." icon="🗂️" />
        </div>
        <BaseTable v-else>
          <thead>
            <tr>
              <th>순서</th>
              <th>코드</th>
              <th>명칭</th>
              <th>설명</th>
              <th>사용여부</th>
              <th class="col-actions">액션</th>
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
              <td class="col-actions">
                <TableRowActions
                  :delete-loading="store.deleteLoadingId === c.id"
                  @edit="openEdit(c, $event)"
                  @delete="handleDelete(c, $event)"
                />
              </td>
            </tr>
          </tbody>
        </BaseTable>
      </section>
    </template>

    <CommonCodeFormModal
      v-if="showForm"
      :code="editingCode"
      :default-group-code="store.selectedGroupCode"
      @close="closeForm"
      @saved="handleSaved"
    />
  </div>
</template>

<style scoped>
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

.cc-code-panel {
  margin-top: var(--space-4);
}

.cc-desc-cell {
  color: var(--color-text-muted);
  font-size: 0.84rem;
}

:deep(tr.selected) {
  background: var(--color-primary-soft);
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
