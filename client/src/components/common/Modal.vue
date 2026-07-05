<script setup lang="ts">
import BaseModal from '@/components/base/BaseModal.vue';

withDefaults(defineProps<{ title: string; widthPx?: number; size?: 'sm' | 'md' | 'lg' | 'xl' }>(), {
  size: 'md',
});
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <BaseModal :title="title" :size="size" :width-px="widthPx" @close="emit('close')">
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </BaseModal>
</template>
