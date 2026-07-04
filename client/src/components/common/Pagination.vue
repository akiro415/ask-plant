<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ page: number; totalPages: number }>();
const emit = defineEmits<{ (e: 'update:page', value: number): void }>();

const pages = computed(() => {
  const range: number[] = [];
  const start = Math.max(1, props.page - 2);
  const end = Math.min(props.totalPages, start + 4);
  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

function go(p: number) {
  if (p < 1 || p > props.totalPages || p === props.page) return;
  emit('update:page', p);
}
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button type="button" :disabled="page === 1" @click="go(page - 1)">‹</button>
    <button v-for="p in pages" :key="p" type="button" :class="{ active: p === page }" @click="go(p)">{{ p }}</button>
    <button type="button" :disabled="page === totalPages" @click="go(page + 1)">›</button>
  </div>
</template>
