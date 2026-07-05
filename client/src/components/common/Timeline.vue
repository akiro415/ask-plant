<script setup lang="ts">
import type { PlantHistory } from '@/types/history';
import { formatDateTime, formatCurrency } from '@/utils/format';
import EmptyState from './EmptyState.vue';
import BaseButton from '@/components/base/BaseButton.vue';

defineProps<{
  histories: PlantHistory[];
  showActions?: boolean;
  deleteLoadingId?: string | null;
}>();

const emit = defineEmits<{ delete: [id: string]; edit: [history: PlantHistory] }>();
</script>

<template>
  <div v-if="histories.length > 0" class="timeline">
    <div v-for="h in histories" :key="h.id" class="timeline-item">
      <span class="timeline-dot" />
      <div class="timeline-header">
        <span class="timeline-title">{{ h.title ?? h.historyType.name }}</span>
        <div class="timeline-header-right">
          <span class="timeline-date">{{ formatDateTime(h.performedAt) }}</span>
          <BaseButton v-if="showActions" variant="outline" size="sm" @click="emit('edit', h)">수정</BaseButton>
          <BaseButton
            v-if="showActions"
            variant="outline"
            size="sm"
            destructive
            :disabled="deleteLoadingId === h.id"
            @click="emit('delete', h.id)"
          >
            {{ deleteLoadingId === h.id ? '...' : '삭제' }}
          </BaseButton>
        </div>
      </div>
      <div v-if="h.description" class="timeline-desc">{{ h.description }}</div>
      <div v-if="h.amount != null" class="timeline-desc">금액: {{ formatCurrency(h.amount) }}</div>
      <div v-if="h.fromLocation || h.toLocation" class="timeline-desc">
        {{ h.fromLocation?.name ?? '-' }} → {{ h.toLocation?.name ?? '-' }}
      </div>
      <div v-if="h.performedBy" class="timeline-desc">담당: {{ h.performedBy }}</div>
      <img v-if="h.image" :src="h.image.url" class="timeline-image" alt="이력 사진" />
    </div>
  </div>
  <EmptyState v-else message="등록된 이력이 없습니다." icon="📋" />
</template>

<style scoped>
.timeline-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.timeline-header-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
</style>
