<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useHistoryStore } from '@/stores/history';
import Modal from '@/components/common/Modal.vue';

const props = defineProps<{ plantId: string }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const store = useHistoryStore();

onMounted(() => {
  store.ensureTypeOptionsLoaded();
});

const form = reactive({
  type: store.typeOptions[0]?.code ?? 'MEMO',
  description: '',
  performedAt: new Date().toISOString().slice(0, 16),
  title: '',
});

const isValid = computed(() => form.type.trim().length > 0);
const canSubmit = computed(() => isValid.value && !store.formLoading);

async function handleSubmit() {
  if (!isValid.value) return;

  const ok = await store.createHistory(props.plantId, {
    type: form.type,
    description: form.description.trim() ? form.description.trim() : null,
    performedAt: new Date(form.performedAt).toISOString(),
    title: form.title.trim() ? form.title.trim() : null,
  });

  if (ok) emit('saved');
}
</script>

<template>
  <Modal title="이력 등록" @close="emit('close')">
    <form class="history-form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="hf-type">유형 <span class="required">*</span></label>
        <select id="hf-type" v-model="form.type" required>
          <option v-for="t in store.typeOptions" :key="t.id" :value="t.code">{{ t.name }} ({{ t.code }})</option>
          <option v-if="store.typeOptions.length === 0" value="MEMO">메모 (MEMO)</option>
        </select>
      </div>

      <div class="form-field">
        <label for="hf-performedAt">일시</label>
        <input id="hf-performedAt" v-model="form.performedAt" type="datetime-local" />
      </div>

      <div class="form-field">
        <label for="hf-title">제목</label>
        <input id="hf-title" v-model="form.title" type="text" placeholder="선택 입력" />
      </div>

      <div class="form-field">
        <label for="hf-description">설명</label>
        <textarea id="hf-description" v-model="form.description" rows="3" placeholder="이력 내용을 입력하세요" />
      </div>

      <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
    </form>

    <template #footer>
      <button type="button" class="btn btn-ghost" @click="emit('close')">취소</button>
      <button type="button" class="btn btn-primary" :disabled="!canSubmit" @click="handleSubmit">
        {{ store.formLoading ? '등록 중...' : '등록' }}
      </button>
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
  color: var(--color-text);
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
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
}

.form-field textarea {
  resize: vertical;
}

.form-error {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.85rem;
}
</style>
