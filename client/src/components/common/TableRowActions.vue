<script setup lang="ts">
import IconButton from '@/components/base/IconButton.vue';

withDefaults(
  defineProps<{
    showEdit?: boolean;
    showDelete?: boolean;
    showView?: boolean;
    deleteLoading?: boolean;
    editLabel?: string;
    deleteLabel?: string;
    viewLabel?: string;
  }>(),
  {
    showEdit: true,
    showDelete: true,
    showView: false,
    deleteLoading: false,
    editLabel: '수정',
    deleteLabel: '삭제',
    viewLabel: '상세',
  },
);

const emit = defineEmits<{ edit: [event: MouseEvent]; delete: [event: MouseEvent]; view: [event: MouseEvent] }>();
</script>

<template>
  <div class="table-row-actions">
    <IconButton v-if="showView" icon="view" :label="viewLabel" @click="emit('view', $event)" />
    <IconButton v-if="showEdit" icon="edit" :label="editLabel" @click="emit('edit', $event)" />
    <IconButton
      v-if="showDelete"
      icon="delete"
      variant="danger"
      :label="deleteLabel"
      :disabled="deleteLoading"
      @click="emit('delete', $event)"
    />
  </div>
</template>

<style scoped>
.table-row-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-1);
}
</style>
