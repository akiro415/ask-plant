<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import { useHistoryStore } from '@/stores/history';
import type { PlantHistory } from '@/types/history';
import Modal from '@/components/common/Modal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseAutocomplete from '@/components/base/BaseAutocomplete.vue';

const props = defineProps<{ plantId: string; history?: PlantHistory | null }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const store = useHistoryStore();
const isEdit = computed(() => Boolean(props.history));

onMounted(() => {
  store.ensureTypeOptionsLoaded();
});

const form = reactive({
  type: props.history?.historyType.code ?? store.typeOptions[0]?.code ?? 'MEMO',
  description: props.history?.description ?? '',
  performedAt: props.history?.performedAt
    ? props.history.performedAt.slice(0, 16)
    : new Date().toISOString().slice(0, 16),
  title: props.history?.title ?? '',
});

watch(
  () => props.history,
  (history) => {
    if (!history) return;
    form.type = history.historyType.code;
    form.description = history.description ?? '';
    form.performedAt = history.performedAt.slice(0, 16);
    form.title = history.title ?? '';
  },
);

const isValid = computed(() => form.type.trim().length > 0);
const canSubmit = computed(() => isValid.value && !store.formLoading);

const typeAutocompleteOptions = computed(() =>
  store.typeOptions.map((opt) => ({ value: opt.code, label: opt.name, keywords: opt.code })),
);

async function handleSubmit() {
  if (!isValid.value) return;

  const payload = {
    type: form.type,
    description: form.description.trim() ? form.description.trim() : null,
    performedAt: new Date(form.performedAt).toISOString(),
    title: form.title.trim() ? form.title.trim() : null,
  };

  const ok = isEdit.value && props.history
    ? await store.updateHistory(props.history.id, props.plantId, payload)
    : await store.createHistory(props.plantId, payload);

  if (ok) emit('saved');
}
</script>

<template>
  <Modal :title="isEdit ? '이력 수정' : '이력 등록'" @close="emit('close')">
    <form class="history-form" @submit.prevent="handleSubmit">
      <BaseAutocomplete id="hf-type" v-model="form.type" label="유형" required :options="typeAutocompleteOptions" placeholder="유형 검색" />
      <div class="form-field">
        <label for="hf-title">제목</label>
        <input id="hf-title" v-model="form.title" type="text" />
      </div>
      <div class="form-field">
        <label for="hf-performedAt">일시</label>
        <input id="hf-performedAt" v-model="form.performedAt" type="datetime-local" />
      </div>
      <div class="form-field">
        <label for="hf-desc">설명</label>
        <textarea id="hf-desc" v-model="form.description" rows="3" />
      </div>
      <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!canSubmit" @click="handleSubmit">
        {{ store.formLoading ? '저장 중...' : '저장' }}
      </BaseButton>
    </template>
  </Modal>
</template>

<style scoped>
.history-form {
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
}

.required {
  color: var(--color-danger);
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.88rem;
  font-family: inherit;
}
</style>
