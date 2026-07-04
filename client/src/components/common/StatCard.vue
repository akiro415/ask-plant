<script setup lang="ts">
defineProps<{ icon: string; label: string; value: string | number }>();
</script>

<template>
  <div class="stat-card">
    <div class="stat-card-icon">{{ icon }}</div>
    <div>
      <div class="stat-card-label">{{ label }}</div>
      <div class="stat-card-value">{{ value }}</div>
    </div>
  </div>
</template>
