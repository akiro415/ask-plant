<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue';

withDefaults(
  defineProps<{
    listTo: string;
    editMode?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    saving?: boolean;
    deleteLoading?: boolean;
    deleteLabel?: string;
  }>(),
  {
    editMode: false,
    canEdit: true,
    canDelete: false,
    saving: false,
    deleteLoading: false,
    deleteLabel: '삭제',
  },
);

const emit = defineEmits<{ edit: []; save: []; cancel: []; delete: [] }>();
</script>

<template>
  <div class="detail-page-actions">
    <template v-if="editMode">
      <BaseButton variant="ghost" size="sm" :disabled="saving" @click="emit('cancel')">취소</BaseButton>
      <BaseButton variant="primary" size="sm" :disabled="saving" :loading="saving" @click="emit('save')">
        {{ saving ? '저장 중...' : '저장' }}
      </BaseButton>
    </template>
    <template v-else>
      <BaseButton v-if="canEdit" variant="outline" size="sm" @click="emit('edit')">수정</BaseButton>
      <BaseButton
        v-if="canDelete"
        variant="danger"
        size="sm"
        :disabled="deleteLoading"
        @click="emit('delete')"
      >
        {{ deleteLoading ? '처리 중...' : deleteLabel }}
      </BaseButton>
      <BaseButton variant="secondary" size="sm" :to="listTo">목록으로</BaseButton>
    </template>
  </div>
</template>

<style scoped>
.detail-page-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
