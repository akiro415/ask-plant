<script setup lang="ts">
import { useLocationStore } from '@/stores/location';
import PageHeader from '@/components/common/PageHeader.vue';

const store = useLocationStore();
</script>

<template>
  <div>
    <PageHeader title="위치관리" subtitle="온실 &gt; 구역 &gt; 선반의 계층 구조와 지도 좌표를 관리합니다.">
      <template #actions>
        <button type="button" class="btn btn-primary" disabled title="Mock 화면에서는 비활성화됩니다">+ 위치 등록</button>
      </template>
    </PageHeader>

    <div class="panel">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>위치명</th>
              <th>코드</th>
              <th>유형</th>
              <th>상위 위치</th>
              <th>지도 좌표</th>
              <th>개체 수</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loc in store.locations" :key="loc.id">
              <td>
                <span :style="{ paddingLeft: `${loc.depth * 1.25}rem` }">
                  <span v-if="loc.depth > 0" class="tree-branch">└</span>
                  {{ loc.name }}
                </span>
              </td>
              <td><code>{{ loc.code }}</code></td>
              <td><span class="badge badge-blue">{{ loc.type?.name ?? '-' }}</span></td>
              <td>{{ loc.parentName ?? '-' }}</td>
              <td>
                <span v-if="loc.posX != null && loc.posY != null">x:{{ loc.posX.toFixed(2) }}, y:{{ loc.posY.toFixed(2) }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ loc.plantCount }}개</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="panel location-map-note">
      <h2 class="info-card-title">지도 미리보기 (Mock)</h2>
      <p class="page-header-subtitle">
        <code>imagePath</code>가 등록된 온실은 배치도 이미지 위에 <code>posX</code>/<code>posY</code> 좌표로 구역 핀을 표시할 예정입니다.
        (실제 이미지 업로드 기능은 API 연결 후 구현)
      </p>
    </div>
  </div>
</template>

<style scoped>
.tree-branch {
  color: var(--color-text-muted);
  margin-right: 0.3rem;
}

.text-muted {
  color: var(--color-text-muted);
}

.info-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.location-map-note {
  margin-top: 1.25rem;
}
</style>
