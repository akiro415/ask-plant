<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLocationStore } from '@/stores/location';
import { usePlantStore } from '@/stores/plant';
import { useAuthStore } from '@/stores/auth';
import type { PlantLocation } from '@/types/location';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import LocationFormModal from './LocationFormModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';

const store = useLocationStore();
const plantStore = usePlantStore();
const auth = useAuthStore();
const router = useRouter();

const canManage = () => auth.hasRole('ADMIN', 'STAFF');

onMounted(() => {
  store.fetchLocationList();
  // 위치별 "개체 수" 계산에 필요 — 목록 화면을 거치지 않고 바로 진입해도 값이 채워지도록 최초 1회 로드를 보장한다.
  plantStore.ensurePlantsLoaded();
});

const showForm = ref(false);
const editingLocation = ref<PlantLocation | null>(null);

function openCreate() {
  editingLocation.value = null;
  showForm.value = true;
}

function openEdit(location: PlantLocation) {
  editingLocation.value = location;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingLocation.value = null;
}

function handleSaved() {
  closeForm();
}

async function handleDelete(location: PlantLocation) {
  if (!confirm(`'${location.name}' 위치를 삭제하시겠습니까?\n(사용 중인 개체가 있는 경우 비활성화만 되며 데이터는 유지됩니다)`)) return;
  await store.deleteLocation(location.id);
}
</script>

<template>
  <div>
    <PageHeader title="위치관리" subtitle="온실 &gt; 구역 &gt; 선반의 계층 구조와 지도 좌표를 관리합니다.">
      <template #actions>
        <BaseButton v-if="canManage()" variant="primary" @click="openCreate">+ 위치 등록</BaseButton>
      </template>
    </PageHeader>

    <p v-if="store.deleteError" class="form-error form-error--block">{{ store.deleteError }}</p>

    <div class="panel">
      <div v-if="store.listLoading" class="table-empty">
        <EmptyState message="위치 목록을 불러오는 중입니다..." icon="⏳" />
      </div>
      <div v-else-if="store.listError" class="table-empty">
        <EmptyState :message="store.listError" icon="⚠️" />
        <div class="table-empty-actions"><BaseButton variant="outline" size="sm" @click="store.fetchLocationList">다시 시도</BaseButton></div>
      </div>
      <div v-else-if="store.locations.length === 0" class="table-empty">
        <EmptyState message="등록된 위치가 없습니다." icon="📍" />
      </div>
      <BaseTable v-else>
        <thead>
          <tr>
            <th>위치명</th>
            <th>코드</th>
            <th>유형</th>
            <th>상위 위치</th>
            <th>지도 좌표</th>
            <th>개체 수</th>
            <th v-if="canManage()" class="col-actions">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loc in store.locations" :key="loc.id" class="clickable" @click="router.push(`/admin/locations/${loc.id}`)">
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
            <td v-if="canManage()" class="col-actions" @click.stop>
              <div class="col-actions-inner">
                <BaseButton variant="outline" size="sm" @click="openEdit(loc)">수정</BaseButton>
                <BaseButton
                  variant="outline"
                  size="sm"
                  destructive
                  :disabled="store.deleteLoadingId === loc.id"
                  @click="handleDelete(loc)"
                >
                  {{ store.deleteLoadingId === loc.id ? '삭제 중...' : '삭제' }}
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </BaseTable>
    </div>

    <LocationFormModal v-if="showForm" :location="editingLocation" @close="closeForm" @saved="handleSaved" />

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

.table-empty {
  padding: 1rem 0;
}

.table-empty-actions {
  display: flex;
  justify-content: center;
  margin-top: -1rem;
}

.info-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.location-map-note {
  margin-top: var(--space-5);
}
</style>
