<script setup lang="ts">
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
      <button type="button" class="btn btn-outline btn-sm" @click="emit('edit')">수정</button>
    </template>
    <template v-else>
      <button type="button" class="btn btn-ghost btn-sm" :disabled="saving" @click="emit('cancel')">취소</button>
      <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="emit('save')">
        {{ saving ? '저장 중...' : '저장' }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.detail-edit-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
