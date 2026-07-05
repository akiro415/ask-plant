<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useCommonCodeStore } from '@/stores/common-code';
import type { CommonCode } from '@/types/common';
import Modal from '@/components/common/Modal.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps<{
  code: CommonCode | null;
  defaultGroupCode?: string | null;
}>();

const emit = defineEmits<{ close: []; saved: [] }>();

const store = useCommonCodeStore();
const isEdit = computed(() => props.code !== null);

const form = reactive({
  groupCode: props.code?.groupCode ?? props.defaultGroupCode ?? '',
  code: props.code?.code ?? '',
  name: props.code?.name ?? '',
  description: props.code?.description ?? '',
  sortOrder: props.code?.sortOrder ?? ('' as number | string),
  isActive: props.code?.isActive !== false,
});

const isValid = computed(
  () => form.groupCode.trim().length > 0 && form.code.trim().length > 0 && form.name.trim().length > 0,
);
const canSubmit = computed(() => isValid.value && !store.formLoading);

function toNullable(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

async function handleSubmit() {
  if (!isValid.value) return;

  const payload = {
    groupCode: form.groupCode.trim(),
    code: form.code.trim(),
    name: form.name.trim(),
    description: toNullable(form.description),
    sortOrder: form.sortOrder === '' ? undefined : Number(form.sortOrder),
    isActive: form.isActive,
  };

  const ok = isEdit.value
    ? await store.updateCode(props.code!.id, payload)
    : await store.createCode(payload);

  if (ok) emit('saved');
}
</script>

<template>
  <Modal :title="isEdit ? '코드 수정' : '코드 등록'" :width-px="520" @close="emit('close')">
    <form class="cc-form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label>그룹코드</label>
        <input v-model="form.groupCode" type="text" required :disabled="isEdit" placeholder="예: PLANT_STATUS" />
      </div>
      <div class="form-field">
        <label>코드</label>
        <input v-model="form.code" type="text" required :disabled="isEdit" placeholder="예: AVAILABLE" />
      </div>
      <div class="form-field">
        <label>명칭</label>
        <input v-model="form.name" type="text" required placeholder="표시 이름" />
      </div>
      <div class="form-field">
        <label>설명</label>
        <input v-model="form.description" type="text" placeholder="선택 입력" />
      </div>
      <div class="form-field">
        <label>정렬순서</label>
        <input v-model="form.sortOrder" type="number" min="0" step="1" placeholder="0" />
      </div>
      <div class="form-field form-field--inline">
        <label>
          <input v-model="form.isActive" type="checkbox" />
          사용
        </label>
      </div>
      <p v-if="store.formError" class="form-error form-error--block">{{ store.formError }}</p>
      <div class="form-actions">
        <BaseButton variant="ghost" type="button" @click="emit('close')">취소</BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="!canSubmit" :loading="store.formLoading">
          {{ isEdit ? '저장' : '등록' }}
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

.form-field input[type='text'],
.form-field input[type='number'] {
  height: var(--input-height-md);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.form-field--inline label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
