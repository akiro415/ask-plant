<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue';

defineProps<{
  editMode: boolean;
  canEdit?: boolean;
  saving?: boolean;
}>();

const emit = defineEmits<{ edit: []; save: []; cancel: [] }>();
</script>

<template>
  <div v-if="canEdit !== false" class="detail-edit-toolbar">
    <template v-if="!editMode">
      <BaseButton variant="outline" size="sm" @click="emit('edit')">수정</BaseButton>
    </template>
    <template v-else>
      <BaseButton variant="ghost" size="sm" :disabled="saving" @click="emit('cancel')">취소</BaseButton>
      <BaseButton variant="primary" size="sm" :disabled="saving" :loading="saving" @click="emit('save')">
        {{ saving ? '저장 중...' : '저장' }}
      </BaseButton>
    </template>
  </div>
</template>

<style scoped>
.detail-edit-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
