<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import type { AdminUser, UserRole } from '@/types/user';
import { USER_ROLE_LABEL } from '@/types/user';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import UserFormModal from './UserFormModal.vue';
import { formatDate } from '@/utils/format';

const store = useUserStore();
const auth = useAuthStore();

const ROLE_TONE: Record<string, string> = {
  ADMIN: 'badge-red',
  STAFF: 'badge-blue',
  CUSTOMER: 'badge-gray',
};

const editingUser = ref<AdminUser | null>(null);
const showForm = ref(false);

onMounted(() => {
  store.fetchUserList();
});

function openEdit(user: AdminUser) {
  editingUser.value = user;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingUser.value = null;
}

function handleSaved() {
  closeForm();
}

async function handleDelete(user: AdminUser) {
  if (user.id === auth.user?.id) return;
  if (!confirm(`'${user.name}' 사용자를 비활성화하시겠습니까?`)) return;
  await store.deleteUser(user.id);
}

async function toggleIncludeInactive() {
  store.setIncludeInactive(!store.includeInactive);
  await store.fetchUserList();
}
</script>

<template>
  <div>
    <PageHeader title="사용자관리" subtitle="관리자, 직원, 고객 계정을 관리합니다.">
      <template #actions>
        <button type="button" class="btn btn-primary" disabled title="사용자 생성 API는 아직 구현되지 않았습니다">+ 사용자 추가</button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <input
        type="text"
        placeholder="이름, 이메일, 연락처 검색"
        :value="store.searchQuery"
        @input="store.setSearch(($event.target as HTMLInputElement).value)"
      />
      <select :value="store.roleFilter" @change="store.setRoleFilter(($event.target as HTMLSelectElement).value as UserRole | '')">
        <option value="">전체 역할</option>
        <option value="ADMIN">관리자</option>
        <option value="STAFF">직원</option>
        <option value="CUSTOMER">고객</option>
      </select>
      <label class="filter-checkbox">
        <input type="checkbox" :checked="store.includeInactive" @change="toggleIncludeInactive" />
        비활성 포함
      </label>
      <span class="filter-total">총 {{ store.filtered.length }}명</span>
    </div>

    <p v-if="store.deleteError" class="form-error">{{ store.deleteError }}</p>

    <div class="panel">
      <div v-if="store.listLoading" class="table-empty">
        <EmptyState message="사용자 목록을 불러오는 중입니다..." icon="⏳" />
      </div>
      <div v-else-if="store.listError" class="table-empty">
        <EmptyState :message="store.listError" icon="⚠️" />
        <div class="table-empty-actions"><button type="button" class="btn btn-outline btn-sm" @click="store.fetchUserList">다시 시도</button></div>
      </div>
      <div v-else-if="store.filtered.length === 0" class="table-empty">
        <EmptyState message="조건에 맞는 사용자가 없습니다." icon="👤" />
      </div>
      <div v-else class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>연락처</th>
              <th>역할</th>
              <th>상태</th>
              <th>가입일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in store.filtered" :key="u.id">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.phone ?? '-' }}</td>
              <td><span class="badge" :class="ROLE_TONE[u.role]">{{ USER_ROLE_LABEL[u.role] }}</span></td>
              <td>
                <span class="badge" :class="u.isActive ? 'badge-green' : 'badge-gray'">{{ u.isActive ? '활성' : '비활성' }}</span>
              </td>
              <td>{{ formatDate(u.createdAt) }}</td>
              <td class="user-row-actions">
                <button type="button" class="btn btn-outline btn-sm" @click="openEdit(u)">수정</button>
                <button
                  v-if="u.id !== auth.user?.id && u.isActive"
                  type="button"
                  class="btn btn-outline btn-sm btn-danger-outline"
                  :disabled="store.deleteLoadingId === u.id"
                  @click="handleDelete(u)"
                >
                  {{ store.deleteLoadingId === u.id ? '처리 중...' : '비활성화' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UserFormModal v-if="showForm && editingUser" :user="editingUser" @close="closeForm" @saved="handleSaved" />
  </div>
</template>

<style scoped>
.filter-total {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text);
  white-space: nowrap;
}

.table-empty {
  padding: 1rem 0;
}

.table-empty-actions {
  display: flex;
  justify-content: center;
  margin-top: -1rem;
}

.user-row-actions {
  display: flex;
  gap: 0.4rem;
  white-space: nowrap;
}

.btn-danger-outline {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.form-error {
  margin-bottom: 1rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.85rem;
}
</style>
