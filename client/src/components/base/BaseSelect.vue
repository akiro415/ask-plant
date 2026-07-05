<script setup lang="ts">
type SelectSize = 'sm' | 'md' | 'lg';

const model = defineModel<string | number>();

withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
    size?: SelectSize;
  }>(),
  {
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
    <select
      :id="id"
      v-model="model"
      :required="required"
      :disabled="disabled"
      class="base-select"
      :class="[`base-select--${size}`, { 'base-select--error': !!error }]"
    >
      <slot />
    </select>
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

.base-select {
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

.base-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.base-select--error,
.base-select--error:focus {
  border-color: var(--color-danger);
  box-shadow: var(--focus-ring-danger);
}

.base-select:disabled {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.base-select--sm {
  height: var(--input-height-sm);
  padding: 0 var(--space-3);
  font-size: 0.8125rem;
}

.base-select--md {
  height: var(--input-height-md);
  padding: 0 var(--space-3);
  font-size: 0.875rem;
}

.base-select--lg {
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
