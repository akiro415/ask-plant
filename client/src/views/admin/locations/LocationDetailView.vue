<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLocationStore } from '@/stores/location';
import { usePlantStore } from '@/stores/plant';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import EmptyState from '@/components/common/EmptyState.vue';
import DetailPageActions from '@/components/common/DetailPageActions.vue';
import LocationFormModal from './LocationFormModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTable from '@/components/base/BaseTable.vue';

const route = useRoute();
const router = useRouter();
const store = useLocationStore();
const plantStore = usePlantStore();
const ui = useUiStore();
const auth = useAuthStore();

const showForm = ref(false);
const canManage = computed(() => auth.hasRole('ADMIN', 'STAFF'));

const location = computed(() => store.findById(String(route.params.id)));
const plants = computed(() => plantStore.plants.filter((p) => p.location?.id === location.value?.id));

function sync() {
  ui.setBreadcrumbExtra(location.value?.name ?? null);
}

onMounted(async () => {
  await store.ensureLocationsLoaded();
  await plantStore.ensurePlantsLoaded();
  sync();
});

watch(() => route.params.id, sync);
watch(location, sync);
</script>

<template>
  <div v-if="store.listLoading && !location" class="panel">
    <EmptyState message="위치 정보를 불러오는 중입니다..." icon="⏳" />
  </div>
  <div v-else-if="!location" class="panel">
    <EmptyState message="해당 위치를 찾을 수 없습니다." icon="📍" />
    <div class="table-empty-actions"><BaseButton variant="outline" size="sm" @click="router.push('/admin/locations')">목록으로</BaseButton></div>
  </div>
  <div v-else>
    <div class="page-header-row">
      <div>
        <h1>{{ location.name }}</h1>
        <p class="page-header-subtitle"><code>{{ location.code }}</code> · {{ location.type?.name ?? '-' }}</p>
      </div>
      <DetailPageActions
        v-if="canManage"
        list-to="/admin/locations"
        :can-delete="false"
        @edit="showForm = true"
      />
      <DetailPageActions v-else list-to="/admin/locations" :can-edit="false" :can-delete="false" />
    </div>

    <section class="panel info-card">
      <div class="info-row"><span class="info-label">상위 위치</span><span class="info-value">{{ location.parentName ?? '최상위' }}</span></div>
      <div class="info-row"><span class="info-label">배치도</span><span class="info-value">{{ location.imagePath ?? '-' }}</span></div>
      <div class="info-row"><span class="info-label">좌표</span><span class="info-value">{{ location.posX ?? '-' }}, {{ location.posY ?? '-' }}</span></div>
      <div class="info-row"><span class="info-label">보유 개체</span><span class="info-value">{{ location.plantCount }}개</span></div>
    </section>

    <section class="panel">
      <h2 class="info-card-title">위치 내 개체 ({{ plants.length }}개)</h2>
      <div v-if="plants.length === 0" class="table-empty"><EmptyState message="등록된 개체가 없습니다." icon="🪴" /></div>
      <BaseTable v-else>
        <thead><tr><th>QR코드</th><th>품종</th><th>상태</th></tr></thead>
        <tbody>
          <tr v-for="p in plants" :key="p.id" class="clickable" @click="router.push(`/admin/plants/${p.id}`)">
            <td><code>{{ p.qrCode }}</code></td>
            <td>{{ p.species.displayName }}</td>
            <td>{{ p.status.name }}</td>
          </tr>
        </tbody>
      </BaseTable>
    </section>

    <LocationFormModal v-if="showForm" :location="location" @close="showForm = false" @saved="showForm = false" />
  </div>
</template>

<style scoped>
.info-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--color-text-muted);
}

.info-value {
  font-weight: 600;
}

.table-empty {
  padding: 1rem 0;
}

.table-empty-actions {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}
</style>
