<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import type { AdminUser, UserRole } from '@/types/user';
import { USER_ROLE_LABEL } from '@/types/user';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import FilterBar from '@/components/common/FilterBar.vue';
import UserFormModal from './UserFormModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseAutocomplete from '@/components/base/BaseAutocomplete.vue';
import TableRowActions from '@/components/common/TableRowActions.vue';
import { formatDate } from '@/utils/format';

const store = useUserStore();
const auth = useAuthStore();
const router = useRouter();

const ROLE_TONE: Record<string, string> = {
  ADMIN: 'badge-red',
  STAFF: 'badge-blue',
  CUSTOMER: 'badge-gray',
};

const editingUser = ref<AdminUser | null>(null);
const showForm = ref(false);
const isCreateMode = ref(false);
const localSearch = ref('');

const roleFilterOptions = computed(() =>
  (['ADMIN', 'STAFF', 'CUSTOMER'] as UserRole[]).map((role) => ({ value: role, label: USER_ROLE_LABEL[role] })),
);

const activeFilterOptions = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
];

onMounted(() => {
  store.fetchUserList();
  localSearch.value = store.searchQuery;
});

function applySearch() {
  store.setSearch(localSearch.value.trim());
}

async function applyActiveFilter(value: string) {
  store.setActiveFilter(value as 'all' | 'active' | 'inactive');
  await store.fetchUserList();
}

function applyRoleFilter(value: string) {
  store.setRoleFilter(value as UserRole | '');
}

function openCreate() {
  editingUser.value = null;
  isCreateMode.value = true;
  showForm.value = true;
}

function openEdit(user: AdminUser, event?: Event) {
  event?.stopPropagation();
  editingUser.value = user;
  isCreateMode.value = false;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingUser.value = null;
  isCreateMode.value = false;
}

function goDetail(user: AdminUser) {
  router.push(`/admin/users/${user.id}`);
}

async function handleToggle(user: AdminUser, event: Event) {
  event.stopPropagation();
  if (user.id === auth.user?.id) return;
  const nextActive = !user.isActive;
  const label = nextActive ? '활성화' : '비활성화';
  if (!confirm(`'${user.name}' 사용자를 ${label}하시겠습니까?`)) return;
  await store.toggleUserActive(user.id, nextActive);
}
</script>

<template>
  <div>
    <PageHeader title="사용자관리" subtitle="관리자, 직원, 고객 계정을 관리합니다.">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate">사용자 등록</BaseButton>
      </template>
    </PageHeader>

    <FilterBar v-model:search-query="localSearch" search-placeholder="이름, 이메일 검색" @search="applySearch">
      <template #filters>
        <BaseAutocomplete
          :model-value="store.roleFilter"
          variant="filter"
          :options="roleFilterOptions"
          nullable
          empty-label="전체 역할"
          placeholder="역할"
          min-width="130px"
          @update:model-value="applyRoleFilter"
        />
        <BaseAutocomplete
          :model-value="store.activeFilter"
          variant="filter"
          :options="activeFilterOptions.slice(1)"
          nullable
          empty-label="전체 상태"
          placeholder="상태"
          min-width="120px"
          @update:model-value="(v) => applyActiveFilter(v || 'all')"
        />
      </template>
      <template #meta>
        <span>총 {{ store.filtered.length }}명</span>
      </template>
    </FilterBar>

    <p v-if="store.toggleError" class="form-error form-error--block">{{ store.toggleError }}</p>

    <div class="panel">
      <div v-if="store.listLoading" class="table-empty">
        <EmptyState message="사용자 목록을 불러오는 중입니다..." icon="⏳" />
      </div>
      <div v-else-if="store.listError" class="table-empty">
        <EmptyState :message="store.listError" icon="⚠️" />
        <div class="table-empty-actions"><BaseButton variant="outline" size="sm" @click="store.fetchUserList">다시 시도</BaseButton></div>
      </div>
      <div v-else-if="store.filtered.length === 0" class="table-empty">
        <EmptyState message="조건에 맞는 사용자가 없습니다." icon="👤" />
      </div>
      <BaseTable v-else>
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>역할</th>
            <th>상태</th>
            <th class="sortable" @click="store.toggleSortOrder()">
              가입일 {{ store.sortOrder === 'desc' ? '↓' : '↑' }}
            </th>
            <th class="col-actions">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in store.filtered" :key="u.id" class="clickable" @click="goDetail(u)">
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td><span class="badge" :class="ROLE_TONE[u.role]">{{ USER_ROLE_LABEL[u.role] }}</span></td>
            <td>
              <span class="badge" :class="u.isActive ? 'badge-green' : 'badge-gray'">{{ u.isActive ? '활성' : '비활성' }}</span>
            </td>
            <td>{{ formatDate(u.createdAt) }}</td>
            <td class="col-actions" @click.stop>
              <TableRowActions
                :show-delete="u.id !== auth.user?.id"
                :delete-loading="store.toggleLoadingId === u.id"
                :delete-label="u.isActive ? '비활성화' : '활성화'"
                @edit="openEdit(u, $event)"
                @delete="handleToggle(u, $event)"
              />
            </td>
          </tr>
        </tbody>
      </BaseTable>
    </div>

    <UserFormModal v-if="showForm" :user="isCreateMode ? null : editingUser" @close="closeForm" @saved="closeForm" />
  </div>
</template>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
}

.table-empty {
  padding: var(--space-4) 0;
}

.table-empty-actions {
  display: flex;
  justify-content: center;
  margin-top: -1rem;
}
</style>
