<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import type { AdminUser, UserRole } from '@/types/user';
import { USER_ROLE_LABEL } from '@/types/user';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import UserFormModal from './UserFormModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';
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

onMounted(() => {
  store.fetchUserList();
});

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

async function applyActiveFilter(value: string) {
  store.setActiveFilter(value as 'all' | 'active' | 'inactive');
  await store.fetchUserList();
}

async function applyRoleFilter(value: string) {
  store.setRoleFilter(value as UserRole | '');
}

async function handleDelete(user: AdminUser, event: Event) {
  event.stopPropagation();
  if (user.id === auth.user?.id) return;
  if (!confirm(`'${user.name}' 사용자를 비활성화하시겠습니까?`)) return;
  await store.deleteUser(user.id);
}
</script>

<template>
  <div>
    <PageHeader title="사용자관리" subtitle="관리자, 직원, 고객 계정을 관리합니다.">
      <template #actions>
        <BaseButton variant="primary" disabled title="사용자 생성 API는 아직 구현되지 않았습니다">+ 사용자 추가</BaseButton>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <input
        type="text"
        placeholder="이름, 이메일 검색"
        :value="store.searchQuery"
        @input="store.setSearch(($event.target as HTMLInputElement).value)"
      />
      <select :value="store.roleFilter" @change="applyRoleFilter(($event.target as HTMLSelectElement).value)">
        <option value="">전체 역할</option>
        <option value="ADMIN">관리자</option>
        <option value="STAFF">직원</option>
        <option value="CUSTOMER">고객</option>
      </select>
      <select :value="store.activeFilter" @change="applyActiveFilter(($event.target as HTMLSelectElement).value)">
        <option value="all">전체 상태</option>
        <option value="active">활성만</option>
        <option value="inactive">비활성만</option>
      </select>
      <span class="filter-total">총 {{ store.filtered.length }}명</span>
    </div>

    <p v-if="store.deleteError" class="form-error form-error--block">{{ store.deleteError }}</p>

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
              <div class="col-actions-inner">
                <BaseButton variant="outline" size="sm" @click="openEdit(u, $event)">수정</BaseButton>
                <BaseButton
                  v-if="u.id !== auth.user?.id && u.isActive"
                  variant="outline"
                  size="sm"
                  destructive
                  :disabled="store.deleteLoadingId === u.id"
                  @click="handleDelete(u, $event)"
                >
                  {{ store.deleteLoadingId === u.id ? '...' : '비활성' }}
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </BaseTable>
    </div>

    <UserFormModal v-if="showForm && editingUser" :user="editingUser" @close="closeForm" @saved="closeForm" />
  </div>
</template>

<style scoped>
.filter-total {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.sortable {
  cursor: pointer;
  user-select: none;
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
