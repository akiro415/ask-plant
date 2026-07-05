<script setup lang="ts">
withDefaults(
  defineProps<{
    stickyHeader?: boolean;
    zebra?: boolean;
    compact?: boolean;
  }>(),
  {
    stickyHeader: false,
    zebra: false,
    compact: false,
  },
);
</script>

<template>
  <div class="base-table-wrapper" :class="{ 'base-table-wrapper--sticky': stickyHeader }">
    <table
      class="base-table"
      :class="{
        'base-table--zebra': zebra,
        'base-table--compact': compact,
      }"
    >
      <slot />
    </table>
  </div>
</template>

<style scoped>
.base-table-wrapper {
  overflow-x: auto;
}

.base-table-wrapper--sticky {
  max-height: 70vh;
  overflow-y: auto;
}

.base-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.base-table :deep(thead th) {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-secondary);
  font-weight: 700;
  font-size: 0.8125rem;
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
  background: var(--color-surface);
}

.base-table-wrapper--sticky :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 1;
}

.base-table :deep(tbody td) {
  padding: 0 var(--space-4);
  height: var(--table-row-height);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.base-table--compact :deep(tbody td) {
  height: 40px;
}

.base-table :deep(tbody tr:hover) {
  background: var(--color-primary-soft);
}

.base-table--zebra :deep(tbody tr:nth-child(even)) {
  background: rgba(245, 247, 245, 0.6);
}

.base-table--zebra :deep(tbody tr:nth-child(even):hover) {
  background: var(--color-primary-soft);
}

.base-table :deep(tbody tr.clickable) {
  cursor: pointer;
}

.base-table :deep(.col-actions) {
  text-align: right;
  white-space: nowrap;
}

.base-table :deep(.col-actions-inner) {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
