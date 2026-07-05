<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { USER_ROLE_LABEL, type UserRole } from '@/types/user';
import EmptyState from '@/components/common/EmptyState.vue';
import DetailEditToolbar from '@/components/common/DetailEditToolbar.vue';
import { formatDate } from '@/utils/format';
import BaseButton from '@/components/base/BaseButton.vue';

const route = useRoute();
const router = useRouter();
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

async function handleDeactivate() {
  if (!user.value || user.value.id === auth.user?.id) return;
  if (!confirm(`'${user.value.name}' 사용자를 비활성화하시겠습니까?`)) return;
  const ok = await store.deleteUser(user.value.id);
  if (ok) await load();
}

onMounted(load);
watch(() => route.params.id, load);
</script>

<template>
  <div v-if="store.detailLoading" class="panel"><EmptyState message="사용자 정보를 불러오는 중..." icon="⏳" /></div>
  <div v-else-if="store.detailError" class="panel">
    <EmptyState :message="store.detailError" icon="⚠️" />
    <div class="actions-center"><BaseButton variant="outline" size="sm" @click="load">다시 시도</BaseButton></div>
  </div>
  <div v-else-if="user">
    <div class="page-header-row">
      <div>
        <h1>{{ user.name }}</h1>
        <p class="page-header-subtitle">{{ user.email }}</p>
      </div>
      <div class="detail-actions">
        <DetailEditToolbar
          v-if="canManage"
          :edit-mode="editMode"
          :saving="store.formLoading"
          @edit="startEdit"
          @save="saveEdit"
          @cancel="cancelEdit"
        />
        <BaseButton variant="outline" size="sm" @click="router.push('/admin/users')">← 목록으로</BaseButton>
      </div>
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
      <form v-else class="edit-form" @submit.prevent="saveEdit">
        <div class="form-field"><label>이름</label><input v-model="form.name" type="text" required /></div>
        <div class="form-field"><label>이메일</label><input type="email" :value="user.email" disabled /></div>
        <div class="form-field"><label>연락처</label><input v-model="form.phone" type="text" /></div>
        <div class="form-field">
          <label>역할</label>
          <select v-model="form.role">
            <option v-for="role in roleOptions" :key="role" :value="role">{{ USER_ROLE_LABEL[role] }}</option>
          </select>
        </div>
        <div class="form-field form-checkbox">
          <label><input v-model="form.isActive" type="checkbox" /> 활성 계정</label>
        </div>
        <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
      </form>
    </section>

    <div v-if="canManage && !editMode && user.isActive && user.id !== auth.user?.id" class="danger-actions">
      <BaseButton
        variant="outline"
        size="sm"
        destructive
        :disabled="store.deleteLoadingId === user.id"
        @click="handleDeactivate"
      >
        {{ store.deleteLoadingId === user.id ? '처리 중...' : '비활성화' }}
      </BaseButton>
    </div>
  </div>
  <EmptyState v-else message="사용자를 찾을 수 없습니다." icon="👤" />
</template>

<style scoped>
.detail-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 0;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--color-text-muted);
}

.info-value {
  font-weight: 600;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 600;
}

.form-field input,
.form-field select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.form-checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.actions-center {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.danger-actions {
  margin-top: 1rem;
}
</style>
