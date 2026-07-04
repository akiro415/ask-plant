<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; message: string }>(), { icon: '🌱' });
</script>

<template>
  <div class="empty-state">
    <div class="empty-state-icon">{{ icon }}</div>
    <div>{{ message }}</div>
  </div>
</template>
