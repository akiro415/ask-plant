<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { USER_ROLE_LABEL, type UserRole } from '@/types/user';
import EmptyState from '@/components/common/EmptyState.vue';
import DetailPageActions from '@/components/common/DetailPageActions.vue';
import { formatDate } from '@/utils/format';

const route = useRoute();
const store = useUserStore();
const auth = useAuthStore();

const editMode = ref(false);
const canManage = computed(() => auth.hasRole('ADMIN'));
const roleOptions: UserRole[] = ['ADMIN', 'STAFF', 'CUSTOMER'];

const form = reactive({
  name: '',
  phone: '',
  role: 'CUSTOMER' as UserRole,
  isActive: true,
});

const user = computed(() => store.currentUser);

function syncForm() {
  if (!user.value) return;
  form.name = user.value.name;
  form.phone = user.value.phone ?? '';
  form.role = user.value.role;
  form.isActive = user.value.isActive;
}

async function load() {
  await store.fetchUserById(String(route.params.id));
  syncForm();
}

function startEdit() {
  syncForm();
  editMode.value = true;
}

function cancelEdit() {
  editMode.value = false;
  syncForm();
}

async function saveEdit() {
  if (!user.value) return;
  const ok = await store.updateUser(user.value.id, {
    name: form.name.trim(),
    phone: form.phone.trim() ? form.phone.trim() : null,
    role: form.role,
    isActive: form.isActive,
  });
  if (ok) {
    editMode.value = false;
    await store.fetchUserById(user.value.id);
  }
}

async function handleToggleActive() {
  if (!user.value || user.value.id === auth.user?.id) return;
  const nextActive = !user.value.isActive;
  const label = nextActive ? '활성화' : '비활성화';
  if (!confirm(`'${user.value.name}' 사용자를 ${label}하시겠습니까?`)) return;
  const ok = await store.toggleUserActive(user.value.id, nextActive);
  if (ok) await load();
}

onMounted(load);
watch(() => route.params.id, load);
</script>

<template>
  <div v-if="store.detailLoading" class="panel"><EmptyState message="사용자 정보를 불러오는 중..." icon="⏳" /></div>
  <div v-else-if="store.detailError" class="panel">
    <EmptyState :message="store.detailError" icon="⚠️" />
  </div>
  <div v-else-if="user">
    <div class="page-header-row">
      <div>
        <h1>{{ user.name }}</h1>
        <p class="page-header-subtitle">{{ user.email }}</p>
      </div>
      <DetailPageActions
        v-if="canManage"
        list-to="/admin/users"
        :edit-mode="editMode"
        :can-delete="user.id !== auth.user?.id"
        :delete-loading="store.toggleLoadingId === user.id"
        :delete-label="user.isActive ? '비활성화' : '활성화'"
        :saving="store.formLoading"
        @edit="startEdit"
        @save="saveEdit"
        @cancel="cancelEdit"
        @delete="handleToggleActive"
      />
      <DetailPageActions v-else list-to="/admin/users" :can-edit="false" :can-delete="false" />
    </div>

    <section class="panel info-card">
      <template v-if="!editMode">
        <div class="info-row"><span class="info-label">이름</span><span class="info-value">{{ user.name }}</span></div>
        <div class="info-row"><span class="info-label">이메일</span><span class="info-value">{{ user.email }}</span></div>
        <div class="info-row"><span class="info-label">연락처</span><span class="info-value">{{ user.phone ?? '-' }}</span></div>
        <div class="info-row"><span class="info-label">역할</span><span class="info-value">{{ USER_ROLE_LABEL[user.role] }}</span></div>
        <div class="info-row"><span class="info-label">상태</span><span class="info-value">{{ user.isActive ? '활성' : '비활성' }}</span></div>
        <div class="info-row"><span class="info-label">가입일</span><span class="info-value">{{ formatDate(user.createdAt) }}</span></div>
      </template>
      <form v-else class="form-stack" @submit.prevent="saveEdit">
        <div class="form-field"><label>이름</label><input v-model="form.name" type="text" required /></div>
        <div class="form-field"><label>이메일</label><input type="email" :value="user.email" disabled /></div>
        <div class="form-field"><label>연락처</label><input v-model="form.phone" type="text" /></div>
        <div class="form-field">
          <label>역할</label>
          <select v-model="form.role">
            <option v-for="role in roleOptions" :key="role" :value="role">{{ USER_ROLE_LABEL[role] }}</option>
          </select>
        </div>
        <div class="form-field form-checkbox-label">
          <label><input v-model="form.isActive" type="checkbox" /> 활성 계정</label>
        </div>
        <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
      </form>
    </section>
  </div>
  <EmptyState v-else message="사용자를 찾을 수 없습니다." icon="👤" />
</template>

<style scoped>
.info-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-row {
  display: flex;
  gap: var(--space-4);
  font-size: 0.875rem;
}

.info-label {
  width: 88px;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.info-value {
  color: var(--color-text-primary);
}
</style>
