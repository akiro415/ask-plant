<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const ui = useUiStore();

watch(
  () => route.name,
  () => ui.setBreadcrumbExtra(null),
);

const crumbs = computed<string[]>(() => {
  const base = (route.meta.breadcrumb as string[] | undefined) ?? [];
  return ui.breadcrumbExtra ? [...base, ui.breadcrumbExtra] : base;
});
</script>

<template>
  <nav class="breadcrumb" aria-label="breadcrumb">
    <RouterLink to="/admin/dashboard" class="crumb-home">🏠</RouterLink>
    <template v-for="(crumb, index) in crumbs" :key="index">
      <span class="sep">/</span>
      <span class="crumb" :class="{ active: index === crumbs.length - 1 }">{{ crumb }}</span>
    </template>
  </nav>
</template>
