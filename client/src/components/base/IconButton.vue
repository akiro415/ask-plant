<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: 'edit' | 'delete' | 'view';
    label: string;
    variant?: 'default' | 'danger';
    disabled?: boolean;
    size?: 'sm' | 'md';
  }>(),
  {
    variant: 'default',
    disabled: false,
    size: 'sm',
  },
);

defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <button
    type="button"
    class="icon-btn"
    :class="[`icon-btn--${size}`, `icon-btn--${variant}`]"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <svg v-if="icon === 'edit'" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a1.4 1.4 0 0 0 0-2L14.5 3.5a1.4 1.4 0 0 0-2 0L4 12v8z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
      <path d="M13.5 6.5l4 4" fill="none" stroke="currentColor" stroke-width="1.8" />
    </svg>
    <svg v-else-if="icon === 'delete'" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M9 7V5h6v2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path
        d="M7 7l1 13h8l1-13"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
      <path d="M10 11v6M14 11v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  </button>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
  flex-shrink: 0;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.icon-btn--md svg {
  width: 18px;
  height: 18px;
}

.icon-btn--sm {
  width: 32px;
  height: 32px;
}

.icon-btn--md {
  width: 36px;
  height: 36px;
}

.icon-btn:hover:not(:disabled) {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.icon-btn--danger:hover:not(:disabled) {
  background: var(--color-danger-soft);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
