<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlantStore } from '@/stores/plant';
import { useUiStore } from '@/stores/ui';
import { fetchSpeciesOptions, type SpeciesOption } from '@/api/species.api';
import { fetchCommonCodes } from '@/api/common-code.api';
import { extractErrorMessage } from '@/api/http';
import type { CommonCode } from '@/types/common';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const router = useRouter();
const store = usePlantStore();
const ui = useUiStore();

onMounted(() => ui.setBreadcrumbExtra(null));

// ── 선택 옵션 (dropdown) — value는 항상 id, label은 항상 name/displayName ──
const speciesOptions = ref<SpeciesOption[]>([]);
const statusOptions = ref<CommonCode[]>([]);
const originOptions = ref<CommonCode[]>([]);
const optionsLoading = ref(false);
const optionsError = ref<string | null>(null);

async function loadOptions() {
  optionsLoading.value = true;
  optionsError.value = null;
  try {
    const [species, statuses, origins] = await Promise.all([
      fetchSpeciesOptions(),
      fetchCommonCodes('PLANT_STATUS'),
      fetchCommonCodes('ORIGIN_TYPE'),
    ]);
    speciesOptions.value = species;
    statusOptions.value = statuses;
    originOptions.value = origins;
  } catch (error) {
    optionsError.value = extractErrorMessage(error, '선택 옵션을 불러오지 못했습니다');
  } finally {
    optionsLoading.value = false;
  }
}

onMounted(loadOptions);

// ── 폼 상태 — select value는 id, code는 절대 사용하지 않는다 ──
const form = ref({
  speciesId: '',
  statusId: '',
  originTypeId: '',
  nickname: '',
  purchasePrice: '' as string | number,
  sellingPrice: '' as string | number,
  potSize: '',
  memo: '',
});

const isFormValid = computed(() => Boolean(form.value.speciesId && form.value.statusId && form.value.originTypeId));
const canSubmit = computed(
  () => isFormValid.value && !store.createLoading && speciesOptions.value.length > 0 && statusOptions.value.length > 0 && originOptions.value.length > 0,
);

function speciesLabel(species: SpeciesOption): string {
  return species.scientificName ? `${species.displayName} (${species.scientificName})` : species.displayName;
}

async function handleSubmit() {
  if (!isFormValid.value) return;

  const created = await store.createPlant({
    speciesId: form.value.speciesId,
    statusId: form.value.statusId,
    originTypeId: form.value.originTypeId,
    nickname: form.value.nickname.trim() ? form.value.nickname.trim() : null,
    purchasePrice: form.value.purchasePrice === '' ? null : Number(form.value.purchasePrice),
    sellingPrice: form.value.sellingPrice === '' ? null : Number(form.value.sellingPrice),
    potSize: form.value.potSize.trim() ? form.value.potSize.trim() : null,
    memo: form.value.memo.trim() ? form.value.memo.trim() : null,
  });

  if (created) {
    router.push(`/admin/plants/${created.id}`);
  }
}
</script>

<template>
  <div>
    <PageHeader title="개체 등록" subtitle="새로운 개체(QR)를 등록합니다.">
      <template #actions>
        <button type="button" class="btn btn-outline btn-sm" @click="router.push('/admin/plants')">← 목록으로</button>
      </template>
    </PageHeader>

    <div v-if="optionsLoading" class="panel">
      <EmptyState message="선택 옵션을 불러오는 중입니다..." icon="⏳" />
    </div>

    <div v-else-if="optionsError" class="panel">
      <EmptyState :message="optionsError" icon="⚠️" />
      <div class="form-status-actions"><button type="button" class="btn btn-outline btn-sm" @click="loadOptions">다시 시도</button></div>
    </div>

    <form v-else class="panel create-form" @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-field">
          <label for="speciesId">품종 <span class="required">*</span></label>
          <select id="speciesId" v-model="form.speciesId" :disabled="speciesOptions.length === 0" required>
            <option value="" disabled>{{ speciesOptions.length === 0 ? '등록된 품종이 없습니다' : '품종을 선택하세요' }}</option>
            <option v-for="species in speciesOptions" :key="species.id" :value="species.id">
              {{ speciesLabel(species) }}{{ species.category ? ` · ${species.category.name}` : '' }}
            </option>
          </select>
        </div>

        <div class="form-field">
          <label for="statusId">상태 <span class="required">*</span></label>
          <select id="statusId" v-model="form.statusId" :disabled="statusOptions.length === 0" required>
            <option value="" disabled>{{ statusOptions.length === 0 ? '선택 가능한 상태가 없습니다' : '상태를 선택하세요' }}</option>
            <option v-for="status in statusOptions" :key="status.id" :value="status.id">{{ status.name }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="originTypeId">기원(번식방법) <span class="required">*</span></label>
          <select id="originTypeId" v-model="form.originTypeId" :disabled="originOptions.length === 0" required>
            <option value="" disabled>{{ originOptions.length === 0 ? '선택 가능한 기원이 없습니다' : '기원을 선택하세요' }}</option>
            <option v-for="origin in originOptions" :key="origin.id" :value="origin.id">{{ origin.name }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="nickname">닉네임</label>
          <input id="nickname" v-model="form.nickname" type="text" placeholder="예: 창가 첫째" />
        </div>

        <div class="form-field">
          <label for="purchasePrice">구매가</label>
          <input id="purchasePrice" v-model="form.purchasePrice" type="number" min="0" placeholder="0" />
        </div>

        <div class="form-field">
          <label for="sellingPrice">판매가</label>
          <input id="sellingPrice" v-model="form.sellingPrice" type="number" min="0" placeholder="0" />
        </div>

        <div class="form-field">
          <label for="potSize">화분 크기</label>
          <input id="potSize" v-model="form.potSize" type="text" placeholder="예: 2호" />
        </div>

        <div class="form-field form-field-wide">
          <label for="memo">메모</label>
          <textarea id="memo" v-model="form.memo" rows="3" placeholder="특이사항을 입력하세요" />
        </div>
      </div>

      <p v-if="store.createError" class="form-error">{{ store.createError }}</p>

      <div class="form-actions">
        <button type="button" class="btn btn-ghost" @click="router.push('/admin/plants')">취소</button>
        <button type="submit" class="btn btn-primary" :disabled="!canSubmit">
          {{ store.createLoading ? '등록 중...' : '등록' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-status-actions {
  display: flex;
  justify-content: center;
  margin-top: -1rem;
}

.create-form {
  max-width: 720px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.25rem;
}

.form-field-wide {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.required {
  color: var(--color-danger);
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.88rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
}

.form-field select:disabled,
.form-field input:disabled {
  background: var(--color-bg);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.form-field textarea {
  resize: vertical;
}

.form-error {
  margin-top: 1rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}
</style>
