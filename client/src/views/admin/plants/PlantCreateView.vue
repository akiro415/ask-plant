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
import BaseButton from '@/components/base/BaseButton.vue';

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
  flowerColor: '',
  purchaseHeadCount: '' as string | number,
  purchaseUnitPrice: '' as string | number,
  currentHeadCount: '' as string | number,
  unitSellingPrice: '' as string | number,
  totalSellingPrice: '' as string | number,
  purchaseVendor: '',
  purchaseFarm: '',
  potSize: '',
  memo: '',
});

function toNullableString(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

function toNullableNumber(value: string | number): number | null {
  if (value === '' || value === null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toNullableInt(value: string | number): number | null {
  if (value === '' || value === null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : Math.trunc(n);
}

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
    nickname: toNullableString(form.value.nickname),
    purchasePrice: toNullableNumber(form.value.purchasePrice),
    sellingPrice: toNullableNumber(form.value.sellingPrice),
    flowerColor: toNullableString(form.value.flowerColor),
    purchaseHeadCount: toNullableInt(form.value.purchaseHeadCount),
    purchaseUnitPrice: toNullableNumber(form.value.purchaseUnitPrice),
    currentHeadCount: toNullableInt(form.value.currentHeadCount),
    unitSellingPrice: toNullableNumber(form.value.unitSellingPrice),
    totalSellingPrice: toNullableNumber(form.value.totalSellingPrice),
    purchaseVendor: toNullableString(form.value.purchaseVendor),
    purchaseFarm: toNullableString(form.value.purchaseFarm),
    potSize: toNullableString(form.value.potSize),
    memo: toNullableString(form.value.memo),
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
        <BaseButton variant="outline" size="sm" @click="router.push('/admin/plants')">← 목록</BaseButton>
      </template>
    </PageHeader>

    <div v-if="optionsLoading" class="panel">
      <EmptyState message="선택 옵션을 불러오는 중입니다..." icon="⏳" />
    </div>

    <div v-else-if="optionsError" class="panel">
      <EmptyState :message="optionsError" icon="⚠️" />
      <div class="form-status-actions"><BaseButton variant="outline" size="sm" @click="loadOptions">다시 시도</BaseButton></div>
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
          <label for="flowerColor">꽃색</label>
          <input id="flowerColor" v-model="form.flowerColor" type="text" />
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

      <section class="sales-section">
        <h2 class="sales-section-title">구입 · 판매 정보</h2>
        <div class="form-grid">
          <div class="form-field">
            <label for="purchaseHeadCount">구입두수</label>
            <input id="purchaseHeadCount" v-model="form.purchaseHeadCount" type="number" min="0" step="1" />
          </div>
          <div class="form-field">
            <label for="purchaseUnitPrice">구입 1두 가격</label>
            <input id="purchaseUnitPrice" v-model="form.purchaseUnitPrice" type="number" min="0" step="1" />
          </div>
          <div class="form-field">
            <label for="currentHeadCount">현재 두수</label>
            <input id="currentHeadCount" v-model="form.currentHeadCount" type="number" min="0" step="1" />
          </div>
          <div class="form-field">
            <label for="unitSellingPrice">두수별 판매가</label>
            <input id="unitSellingPrice" v-model="form.unitSellingPrice" type="number" min="0" step="1" />
          </div>
          <div class="form-field">
            <label for="totalSellingPrice">총 판매가</label>
            <input id="totalSellingPrice" v-model="form.totalSellingPrice" type="number" min="0" step="1" />
          </div>
          <div class="form-field">
            <label for="purchaseVendor">구입업체</label>
            <input id="purchaseVendor" v-model="form.purchaseVendor" type="text" />
          </div>
          <div class="form-field">
            <label for="purchaseFarm">구입농장</label>
            <input id="purchaseFarm" v-model="form.purchaseFarm" type="text" placeholder="업체와 다를 수 있음" />
          </div>
          <div class="form-field">
            <label for="purchasePrice">구매가(레거시)</label>
            <input id="purchasePrice" v-model="form.purchasePrice" type="number" min="0" placeholder="0" />
          </div>
          <div class="form-field">
            <label for="sellingPrice">판매가(레거시)</label>
            <input id="sellingPrice" v-model="form.sellingPrice" type="number" min="0" placeholder="0" />
          </div>
        </div>
      </section>

      <p v-if="store.createError" class="form-error">{{ store.createError }}</p>

      <div class="form-actions">
        <BaseButton variant="ghost" @click="router.push('/admin/plants')">취소</BaseButton>
        <BaseButton type="submit" variant="primary" :disabled="!canSubmit">
          {{ store.createLoading ? '등록 중...' : '등록' }}
        </BaseButton>
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.sales-section {
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--color-primary-soft, #e8f5e9);
  border: 1px solid var(--color-primary-lighter, #d8f3dc);
}

.sales-section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
}
</style>
