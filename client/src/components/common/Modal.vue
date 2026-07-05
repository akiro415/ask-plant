<script setup lang="ts">
withDefaults(defineProps<{ title: string; widthPx?: number }>(), { widthPx: 560 });
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-panel" :style="{ maxWidth: `${widthPx}px` }" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
          <button type="button" class="modal-close" aria-label="닫기" @click="emit('close')">×</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 20, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-panel {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.2rem 0.4rem;
}

.modal-close:hover {
  color: var(--color-text);
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
}
</style>
