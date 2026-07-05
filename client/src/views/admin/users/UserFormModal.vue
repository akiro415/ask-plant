<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useUserStore } from '@/stores/user';
import type { AdminUser, UserRole } from '@/types/user';
import { USER_ROLE_LABEL } from '@/types/user';
import Modal from '@/components/common/Modal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseAutocomplete from '@/components/base/BaseAutocomplete.vue';

const props = defineProps<{ user?: AdminUser | null }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const store = useUserStore();
const isEdit = computed(() => Boolean(props.user));

const form = reactive({
  email: props.user?.email ?? '',
  password: '',
  name: props.user?.name ?? '',
  phone: props.user?.phone ?? '',
  role: (props.user?.role ?? 'CUSTOMER') as UserRole,
});

const roleOptions = computed(() =>
  (Object.entries(USER_ROLE_LABEL) as [UserRole, string][]).map(([value, label]) => ({ value, label })),
);

const isValid = computed(() => {
  if (!form.name.trim()) return false;
  if (isEdit.value) return true;
  return form.email.trim().length > 0 && form.password.length >= 8;
});

const canSubmit = computed(() => isValid.value && !store.formLoading);

async function handleSubmit() {
  if (!isValid.value) return;

  const ok = isEdit.value
    ? await store.updateUser(props.user!.id, {
        name: form.name.trim(),
        phone: form.phone.trim() ? form.phone.trim() : null,
        role: form.role,
      })
    : await store.createUser({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        phone: form.phone.trim() ? form.phone.trim() : null,
        role: form.role,
      });

  if (ok) emit('saved');
}
</script>

<template>
  <Modal :title="isEdit ? '사용자 수정' : '사용자 등록'" @close="emit('close')">
    <form class="form-stack" @submit.prevent="handleSubmit">
      <BaseInput
        id="uf-email"
        v-model="form.email"
        label="이메일"
        type="email"
        required
        :disabled="isEdit"
      />

      <BaseInput
        v-if="!isEdit"
        id="uf-password"
        v-model="form.password"
        label="비밀번호"
        type="password"
        required
        placeholder="8자 이상"
      />

      <BaseInput id="uf-name" v-model="form.name" label="이름" required />

      <BaseInput id="uf-phone" v-model="form.phone" label="연락처" placeholder="010-0000-0000" />

      <BaseAutocomplete id="uf-role" v-model="form.role" label="역할" :options="roleOptions" placeholder="역할 선택" />

      <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
    </form>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!canSubmit" :loading="store.formLoading" @click="handleSubmit">
        {{ store.formLoading ? '저장 중...' : isEdit ? '저장' : '등록' }}
      </BaseButton>
    </template>
  </Modal>
</template>
