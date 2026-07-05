<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useUserStore } from '@/stores/user';
import type { AdminUser, UserRole } from '@/types/user';
import { USER_ROLE_LABEL } from '@/types/user';
import Modal from '@/components/common/Modal.vue';

const props = defineProps<{ user: AdminUser }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const store = useUserStore();

const form = reactive({
  name: props.user.name,
  phone: props.user.phone ?? '',
  role: props.user.role as UserRole,
});

const roleOptions = Object.entries(USER_ROLE_LABEL) as [UserRole, string][];

const isValid = computed(() => form.name.trim().length > 0);
const canSubmit = computed(() => isValid.value && !store.formLoading);

async function handleSubmit() {
  if (!isValid.value) return;

  const ok = await store.updateUser(props.user.id, {
    name: form.name.trim(),
    phone: form.phone.trim() ? form.phone.trim() : null,
    role: form.role,
  });

  if (ok) emit('saved');
}
</script>

<template>
  <Modal title="사용자 수정" @close="emit('close')">
    <form class="user-form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label>이메일</label>
        <input type="email" :value="user.email" disabled />
      </div>

      <div class="form-field">
        <label for="uf-name">이름 <span class="required">*</span></label>
        <input id="uf-name" v-model="form.name" type="text" required />
      </div>

      <div class="form-field">
        <label for="uf-phone">연락처</label>
        <input id="uf-phone" v-model="form.phone" type="text" placeholder="010-0000-0000" />
      </div>

      <div class="form-field">
        <label for="uf-role">역할</label>
        <select id="uf-role" v-model="form.role">
          <option v-for="[value, label] in roleOptions" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>

      <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
    </form>

    <template #footer>
      <button type="button" class="btn btn-ghost" @click="emit('close')">취소</button>
      <button type="button" class="btn btn-primary" :disabled="!canSubmit" @click="handleSubmit">
        {{ store.formLoading ? '저장 중...' : '저장' }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.required {
  color: var(--color-danger);
}

.form-field input,
.form-field select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.88rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
}

.form-field input:disabled {
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.form-error {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.85rem;
}
</style>
