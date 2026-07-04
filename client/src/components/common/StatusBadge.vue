<script setup lang="ts">
import { computed } from 'vue';
import { statusTone } from '@/utils/badge';

const props = defineProps<{ code: string; label: string }>();
const toneClass = computed(() => `badge-${statusTone(props.code)}`);
</script>

<template>
  <span class="badge" :class="toneClass">{{ label }}</span>
</template>
