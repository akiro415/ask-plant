<script setup lang="ts">
const model = defineModel<string>();

withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
    rows?: number;
  }>(),
  {
    required: false,
    disabled: false,
    rows: 3,
  },
);
</script>

<template>
  <div class="base-field" :class="{ 'base-field--error': !!error }">
    <label v-if="label" :for="id" class="base-field__label">
      {{ label }}
      <span v-if="required" class="base-field__required">*</span>
    </label>
    <textarea
      :id="id"
      v-model="model"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      class="base-textarea"
      :class="{ 'base-textarea--error': !!error }"
    />
    <p v-if="error" class="base-field__error">{{ error }}</p>
    <p v-else-if="hint" class="base-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.base-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.base-field__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.base-field__required {
  color: var(--color-danger);
}

.base-textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.base-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.base-textarea--error,
.base-textarea--error:focus {
  border-color: var(--color-danger);
  box-shadow: var(--focus-ring-danger);
}

.base-textarea:disabled {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.base-field__error {
  font-size: 0.75rem;
  color: var(--color-danger);
}

.base-field__hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
