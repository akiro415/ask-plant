<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useUserStore } from '@/stores/user';
import type { AdminUser, UserRole } from '@/types/user';
import { USER_ROLE_LABEL } from '@/types/user';
import Modal from '@/components/common/Modal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';

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
    <form class="form-stack" @submit.prevent="handleSubmit">
      <BaseInput id="uf-email" :model-value="user.email" label="이메일" type="email" disabled />

      <BaseInput id="uf-name" v-model="form.name" label="이름" required />

      <BaseInput id="uf-phone" v-model="form.phone" label="연락처" placeholder="010-0000-0000" />

      <BaseSelect id="uf-role" v-model="form.role" label="역할">
        <option v-for="[value, label] in roleOptions" :key="value" :value="value">{{ label }}</option>
      </BaseSelect>

      <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
    </form>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!canSubmit" :loading="store.formLoading" @click="handleSubmit">
        {{ store.formLoading ? '저장 중...' : '저장' }}
      </BaseButton>
    </template>
  </Modal>
</template>
