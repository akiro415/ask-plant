<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useCommonCodeStore } from '@/stores/common-code';
import Modal from '@/components/common/Modal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';

const props = defineProps<{
  groupCode: string;
  groupLabel: string;
}>();

const emit = defineEmits<{ close: []; saved: [] }>();

const store = useCommonCodeStore();

const form = reactive({
  name: props.groupLabel,
});

const isValid = computed(() => form.name.trim().length > 0);
const canSubmit = computed(() => isValid.value && !store.groupFormLoading);

async function handleSubmit() {
  if (!isValid.value) return;
  const ok = await store.updateGroupLabel(props.groupCode, form.name.trim());
  if (ok) emit('saved');
}
</script>

<template>
  <Modal title="그룹명 수정" :width-px="480" @close="emit('close')">
    <form class="cc-form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label>그룹코드</label>
        <input :value="groupCode" type="text" disabled />
      </div>
      <BaseInput id="group-name" v-model="form.name" label="그룹명" required placeholder="표시 이름" />
      <p v-if="store.groupFormError" class="form-error form-error--block">{{ store.groupFormError }}</p>
      <div class="form-actions">
        <BaseButton variant="ghost" type="button" @click="emit('close')">취소</BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="!canSubmit" :loading="store.groupFormLoading">
          저장
        </BaseButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
.cc-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-field label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form-field input[type='text'] {
  height: var(--input-height-md);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: var(--color-bg-muted, #f5f5f5);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
