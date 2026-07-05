<script setup lang="ts">
const model = defineModel<boolean>({ default: false });

withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    disabled?: boolean;
    hint?: string;
  }>(),
  {
    disabled: false,
  },
);
</script>

<template>
  <div class="base-switch" :class="{ 'base-switch--disabled': disabled }">
    <label :for="id" class="base-switch__label">
      <input
        :id="id"
        v-model="model"
        type="checkbox"
        class="base-switch__input"
        role="switch"
        :aria-checked="model"
        :disabled="disabled"
      />
      <span class="base-switch__track" aria-hidden="true">
        <span class="base-switch__thumb" />
      </span>
      <span v-if="label || $slots.default" class="base-switch__text">
        <slot>{{ label }}</slot>
      </span>
    </label>
    <p v-if="hint" class="base-switch__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.base-switch {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.base-switch__label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  user-select: none;
}

.base-switch--disabled .base-switch__label {
  cursor: not-allowed;
  opacity: 0.55;
}

.base-switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.base-switch__track {
  position: relative;
  flex-shrink: 0;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  background: var(--color-border);
  transition: background-color var(--transition-fast);
}

.base-switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.base-switch__input:checked + .base-switch__track {
  background: var(--color-primary);
}

.base-switch__input:checked + .base-switch__track .base-switch__thumb {
  transform: translateX(18px);
}

.base-switch__input:focus-visible + .base-switch__track {
  box-shadow: var(--focus-ring);
}

.base-switch__input:disabled + .base-switch__track {
  background: var(--color-secondary-soft);
}

.base-switch__input:checked:disabled + .base-switch__track {
  background: var(--color-primary-light);
  opacity: 0.65;
}

.base-switch__text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.base-switch__hint {
  margin: 0;
  padding-left: calc(44px + var(--space-3));
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
