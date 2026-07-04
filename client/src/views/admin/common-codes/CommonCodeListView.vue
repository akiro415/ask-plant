<script setup lang="ts">
import { computed } from 'vue';
import { mockCommonCodes } from '@/mock';
import PageHeader from '@/components/common/PageHeader.vue';
import type { CommonCode } from '@/types/common';

const GROUP_LABELS: Record<string, string> = {
  PLANT_STATUS: '식물 상태 (PLANT_STATUS)',
  HISTORY_TYPE: '이력 유형 (HISTORY_TYPE)',
  LOCATION_TYPE: '위치 유형 (LOCATION_TYPE)',
  ORIGIN_TYPE: '기원(번식) 유형 (ORIGIN_TYPE)',
};

const grouped = computed(() => {
  const map = new Map<string, CommonCode[]>();
  for (const code of mockCommonCodes) {
    const list = map.get(code.groupCode) ?? [];
    list.push(code);
    map.set(code.groupCode, list);
  }
  for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
  return map;
});
</script>

<template>
  <div>
    <PageHeader title="공통코드" subtitle="시스템 전반에서 사용되는 그룹별 코드값을 관리합니다.">
      <template #actions>
        <button type="button" class="btn btn-primary" disabled title="Mock 화면에서는 비활성화됩니다">+ 코드 추가</button>
      </template>
    </PageHeader>

    <div class="code-groups">
      <section v-for="[groupCode, codes] in grouped" :key="groupCode" class="panel">
        <h2 class="info-card-title">{{ GROUP_LABELS[groupCode] ?? groupCode }}</h2>
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>순서</th>
                <th>코드</th>
                <th>명칭</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in codes" :key="c.id">
                <td>{{ c.sortOrder }}</td>
                <td><code>{{ c.code }}</code></td>
                <td>{{ c.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.code-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.info-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.8rem;
}
</style>
