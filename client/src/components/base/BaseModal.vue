<script setup lang="ts">
type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

withDefaults(
  defineProps<{
    title: string;
    size?: ModalSize;
    widthPx?: number;
  }>(),
  {
    size: 'md',
  },
);

const emit = defineEmits<{ close: [] }>();

const SIZE_MAP: Record<ModalSize, number> = {
  sm: 400,
  md: 560,
  lg: 720,
  xl: 960,
};
</script>

<template>
  <Teleport to="body">
    <div class="base-modal-overlay" @click.self="emit('close')">
      <div
        class="base-modal-panel"
        :style="{ maxWidth: `${widthPx ?? SIZE_MAP[size]}px` }"
        role="dialog"
        aria-modal="true"
      >
        <div class="base-modal-header">
          <h2 class="base-modal-title">{{ title }}</h2>
          <button type="button" class="base-modal-close" aria-label="닫기" @click="emit('close')">×</button>
        </div>
        <div class="base-modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="base-modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.base-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 20, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
  animation: base-modal-fade-in var(--transition-base);
}

.base-modal-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: base-modal-scale-in var(--transition-base);
}

.base-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.base-modal-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.base-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.base-modal-close:hover {
  color: var(--color-text-primary);
  background: var(--color-bg);
}

.base-modal-body {
  padding: var(--space-5);
  overflow-y: auto;
}

.base-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
}

@keyframes base-modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes base-modal-scale-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
