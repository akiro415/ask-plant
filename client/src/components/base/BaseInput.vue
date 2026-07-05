<script setup lang="ts">
type InputSize = 'sm' | 'md' | 'lg';

const model = defineModel<string | number>();

withDefaults(
  defineProps<{
    id?: string;
    type?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
    size?: InputSize;
  }>(),
  {
    type: 'text',
    required: false,
    disabled: false,
    size: 'md',
  },
);
</script>

<template>
  <div class="base-field" :class="{ 'base-field--error': !!error }">
    <label v-if="label" :for="id" class="base-field__label">
      {{ label }}
      <span v-if="required" class="base-field__required">*</span>
    </label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="base-input"
      :class="[`base-input--${size}`, { 'base-input--error': !!error }]"
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

.base-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: inherit;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.base-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.base-input--error,
.base-input--error:focus {
  border-color: var(--color-danger);
  box-shadow: var(--focus-ring-danger);
}

.base-input:disabled {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.base-input--sm {
  height: var(--input-height-sm);
  padding: 0 var(--space-3);
  font-size: 0.8125rem;
}

.base-input--md {
  height: var(--input-height-md);
  padding: 0 var(--space-3);
  font-size: 0.875rem;
}

.base-input--lg {
  height: var(--input-height-lg);
  padding: 0 var(--space-4);
  font-size: 0.9375rem;
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
