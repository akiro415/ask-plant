<script setup lang="ts">
import { onMounted, ref } from 'vue';
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
const localSearch = ref('');

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

function openEdit(user: AdminUser, event?: Event) {
  event?.stopPropagation();
  editingUser.value = user;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingUser.value = null;
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
        <BaseButton variant="primary" disabled title="사용자 등록 API는 아직 구현되지 않았습니다">사용자 등록</BaseButton>
      </template>
    </PageHeader>

    <FilterBar v-model:search-query="localSearch" search-placeholder="이름, 이메일 검색" @search="applySearch">
      <template #filters>
        <select :value="store.roleFilter" @change="applyRoleFilter(($event.target as HTMLSelectElement).value)">
          <option value="">전체 역할</option>
          <option value="ADMIN">관리자</option>
          <option value="STAFF">직원</option>
          <option value="CUSTOMER">고객</option>
        </select>
        <select :value="store.activeFilter" @change="applyActiveFilter(($event.target as HTMLSelectElement).value)">
          <option value="all">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
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

    <UserFormModal v-if="showForm && editingUser" :user="editingUser" @close="closeForm" @saved="closeForm" />
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
