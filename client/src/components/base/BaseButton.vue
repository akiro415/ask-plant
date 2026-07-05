<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    to?: string;
    href?: string;
    destructive?: boolean;
    block?: boolean;
    target?: string;
    rel?: string;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    destructive: false,
    block: false,
  },
);

const isLink = computed(() => !!props.to || !!props.href);
const tag = computed(() => {
  if (props.to) return RouterLink;
  if (props.href) return 'a';
  return 'button';
});

const classes = computed(() => [
  'base-btn',
  `base-btn--${props.variant}`,
  `base-btn--${props.size}`,
  {
    'base-btn--destructive': props.destructive && props.variant === 'outline',
    'base-btn--block': props.block,
    'base-btn--loading': props.loading,
  },
]);
</script>

<template>
  <component
    :is="tag"
    :class="classes"
    :type="isLink ? undefined : type"
    :to="to"
    :href="href"
    :target="target"
    :rel="rel"
    :disabled="disabled || loading"
  >
    <slot />
  </component>
</template>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
  font-family: inherit;
}

.base-btn:disabled,
.base-btn--loading {
  opacity: 0.55;
  cursor: not-allowed;
}

.base-btn--block {
  width: 100%;
}

/* Sizes */
.base-btn--sm {
  height: var(--btn-height-sm);
  padding: 0 var(--space-3);
  font-size: 0.8125rem;
}

.base-btn--md {
  height: var(--btn-height-md);
  padding: 0 var(--space-4);
}

.base-btn--lg {
  height: var(--btn-height-lg);
  padding: 0 var(--space-5);
  font-size: 0.9375rem;
}

/* Variants */
.base-btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.base-btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.base-btn--primary:active:not(:disabled) {
  background: #1f4d38;
}

.base-btn--secondary {
  background: var(--color-secondary-soft);
  color: var(--color-text-primary);
}

.base-btn--secondary:hover:not(:disabled) {
  background: #e2e6e3;
}

.base-btn--outline {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.base-btn--outline:hover:not(:disabled) {
  background: var(--color-primary-soft);
}

.base-btn--outline.base-btn--destructive {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.base-btn--outline.base-btn--destructive:hover:not(:disabled) {
  background: var(--color-danger-soft);
}

.base-btn--danger {
  background: var(--color-danger);
  color: #fff;
}

.base-btn--danger:hover:not(:disabled) {
  background: var(--color-danger-hover);
}

.base-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.base-btn--ghost:hover:not(:disabled) {
  background: var(--color-bg);
  color: var(--color-text-primary);
}
</style>
