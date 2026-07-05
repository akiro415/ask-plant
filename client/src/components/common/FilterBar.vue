<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue';

const searchQuery = defineModel<string>('searchQuery', { default: '' });

withDefaults(
  defineProps<{
    searchPlaceholder?: string;
    showSearchButton?: boolean;
  }>(),
  {
    searchPlaceholder: '검색',
    showSearchButton: true,
  },
);

const emit = defineEmits<{ search: [] }>();

function onSearch() {
  emit('search');
}
</script>

<template>
  <div class="filter-bar filter-bar--standard">
    <div class="filter-bar__filters">
      <slot name="filters" />
    </div>
    <div class="filter-bar__search">
      <slot name="search">
        <input
          type="text"
          class="filter-bar__input"
          :placeholder="searchPlaceholder"
          :value="searchQuery"
          @input="searchQuery = ($event.target as HTMLInputElement).value"
          @keyup.enter="onSearch"
        />
      </slot>
      <BaseButton v-if="showSearchButton" variant="secondary" size="sm" @click="onSearch">검색</BaseButton>
    </div>
    <div v-if="$slots.meta" class="filter-bar__meta">
      <slot name="meta" />
    </div>
  </div>
</template>

<style scoped>
.filter-bar--standard {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  align-items: center;
}

.filter-bar__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.filter-bar__search {
  display: flex;
  flex: 1;
  min-width: min(100%, 240px);
  gap: var(--space-2);
  align-items: center;
}

.filter-bar__input {
  flex: 1;
  height: var(--input-height-md);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.filter-bar__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.filter-bar__meta {
  margin-left: auto;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.filter-bar__filters :deep(.base-autocomplete) {
  min-width: 140px;
}

.filter-bar__filters :deep(select),
.filter-bar__filters :deep(.base-autocomplete__input) {
  height: var(--input-height-md);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: var(--color-surface);
  color: var(--color-text-primary);
}
</style>
