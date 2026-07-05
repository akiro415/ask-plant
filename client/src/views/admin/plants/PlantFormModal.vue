<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { usePlantStore } from '@/stores/plant';
import { fetchCommonCodes } from '@/api/common-code.api';
import { fetchLocations } from '@/api/location.api';
import type { PlantDetail } from '@/types/plant';
import type { CommonCode } from '@/types/common';
import type { PlantLocation } from '@/types/location';
import Modal from '@/components/common/Modal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { extractErrorMessage } from '@/api/http';

const props = defineProps<{ plant: PlantDetail }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const store = usePlantStore();

const statusOptions = reactive<CommonCode[]>([]);
const originOptions = reactive<CommonCode[]>([]);
const locationOptions = reactive<PlantLocation[]>([]);
const optionsLoading = ref(false);
const optionsError = ref<string | null>(null);

const form = reactive({
  statusId: '',
  originTypeId: '',
  locationId: '',
  nickname: '',
  purchasePrice: '' as string | number,
  sellingPrice: '' as string | number,
  purchaseDate: '',
  seedDate: '',
  potSize: '',
  memo: '',
  flowerColor: '',
  purchaseHeadCount: '' as string | number,
  purchaseUnitPrice: '' as string | number,
  currentHeadCount: '' as string | number,
  unitSellingPrice: '' as string | number,
  totalSellingPrice: '' as string | number,
  purchaseVendor: '',
  purchaseFarm: '',
});

function syncFormFromPlant() {
  form.nickname = props.plant.nickname ?? '';
  form.purchasePrice = props.plant.purchasePrice ?? '';
  form.sellingPrice = props.plant.sellingPrice ?? '';
  form.potSize = props.plant.potSize ?? '';
  form.memo = props.plant.memo ?? '';
  form.flowerColor = props.plant.flowerColor ?? '';
  form.purchaseHeadCount = props.plant.purchaseHeadCount ?? '';
  form.purchaseUnitPrice = props.plant.purchaseUnitPrice ?? '';
  form.currentHeadCount = props.plant.currentHeadCount ?? '';
  form.unitSellingPrice = props.plant.unitSellingPrice ?? '';
  form.totalSellingPrice = props.plant.totalSellingPrice ?? '';
  form.purchaseVendor = props.plant.purchaseVendor ?? '';
  form.purchaseFarm = props.plant.purchaseFarm ?? '';
  form.purchaseDate = props.plant.purchaseDate ? props.plant.purchaseDate.slice(0, 10) : '';
  form.seedDate = props.plant.seedDate ? props.plant.seedDate.slice(0, 10) : '';
  form.locationId = props.plant.location?.id ?? '';
  form.statusId = statusOptions.find((s) => s.code === props.plant.status.code)?.id ?? '';
  form.originTypeId = originOptions.find((o) => o.code === props.plant.originType.code)?.id ?? '';
}

async function loadOptions() {
  optionsLoading.value = true;
  optionsError.value = null;
  try {
    const [statuses, origins, locations] = await Promise.all([
      fetchCommonCodes('PLANT_STATUS'),
      fetchCommonCodes('ORIGIN_TYPE'),
      fetchLocations(),
    ]);
    statusOptions.splice(0, statusOptions.length, ...statuses);
    originOptions.splice(0, originOptions.length, ...origins);
    locationOptions.splice(0, locationOptions.length, ...locations.map((l) => ({
      id: l.id,
      code: l.code,
      name: l.name,
      type: l.type,
      parentId: l.parentId,
      parentName: l.parent?.name ?? null,
      imagePath: l.imagePath,
      posX: l.posX,
      posY: l.posY,
      depth: 0,
      plantCount: 0,
    })));
    syncFormFromPlant();
  } catch (error) {
    optionsError.value = extractErrorMessage(error, '선택 옵션을 불러오지 못했습니다');
  } finally {
    optionsLoading.value = false;
  }
}

onMounted(loadOptions);
watch(() => props.plant.id, syncFormFromPlant);

const isValid = computed(() => Boolean(form.statusId && form.originTypeId));
const canSubmit = computed(() => isValid.value && !store.updateLoading && !optionsLoading.value);

function toNullableString(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

function toNullableNumber(value: string | number): number | null {
  if (value === '' || value === null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toIsoDate(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function toNullableInt(value: string | number): number | null {
  if (value === '' || value === null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : Math.trunc(n);
}

async function handleSubmit() {
  if (!isValid.value) return;
  const ok = await store.updatePlant(props.plant.id, {
    statusId: form.statusId,
    originTypeId: form.originTypeId,
    locationId: form.locationId || null,
    nickname: toNullableString(form.nickname),
    purchasePrice: toNullableNumber(form.purchasePrice),
    sellingPrice: toNullableNumber(form.sellingPrice),
    flowerColor: toNullableString(form.flowerColor),
    purchaseHeadCount: toNullableInt(form.purchaseHeadCount),
    purchaseUnitPrice: toNullableNumber(form.purchaseUnitPrice),
    currentHeadCount: toNullableInt(form.currentHeadCount),
    unitSellingPrice: toNullableNumber(form.unitSellingPrice),
    totalSellingPrice: toNullableNumber(form.totalSellingPrice),
    purchaseVendor: toNullableString(form.purchaseVendor),
    purchaseFarm: toNullableString(form.purchaseFarm),
    purchaseDate: toIsoDate(form.purchaseDate),
    seedDate: toIsoDate(form.seedDate),
    potSize: toNullableString(form.potSize),
    memo: toNullableString(form.memo),
  });
  if (ok) emit('saved');
}
</script>

<template>
  <Modal title="개체 수정" :width-px="640" @close="emit('close')">
    <div v-if="optionsLoading" class="form-loading">옵션을 불러오는 중...</div>
    <div v-else-if="optionsError" class="form-error">{{ optionsError }}</div>
    <form v-else class="plant-form" @submit.prevent="handleSubmit">
      <div class="form-field form-field-wide">
        <label>품종</label>
        <input type="text" :value="plant.species.displayName" disabled />
      </div>
      <div class="form-field form-field-wide">
        <label>QR코드</label>
        <input type="text" :value="plant.qrCode" disabled />
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label for="pf-status">상태 <span class="required">*</span></label>
          <select id="pf-status" v-model="form.statusId" required>
            <option v-for="s in statusOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="form-field">
          <label for="pf-origin">기원 <span class="required">*</span></label>
          <select id="pf-origin" v-model="form.originTypeId" required>
            <option v-for="o in originOptions" :key="o.id" :value="o.id">{{ o.name }}</option>
          </select>
        </div>
        <div class="form-field">
          <label for="pf-location">위치</label>
          <select id="pf-location" v-model="form.locationId">
            <option value="">미지정</option>
            <option v-for="loc in locationOptions" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
          </select>
        </div>
        <div class="form-field">
          <label for="pf-nickname">닉네임</label>
          <input id="pf-nickname" v-model="form.nickname" type="text" />
        </div>
        <div class="form-field">
          <label for="pf-flower">꽃색</label>
          <input id="pf-flower" v-model="form.flowerColor" type="text" />
        </div>
        <div class="form-field">
          <label for="pf-purchase">구매가(레거시)</label>
          <input id="pf-purchase" v-model="form.purchasePrice" type="number" min="0" step="1" />
        </div>
        <div class="form-field">
          <label for="pf-selling">판매가(레거시)</label>
          <input id="pf-selling" v-model="form.sellingPrice" type="number" min="0" step="1" />
        </div>
        <div class="form-field">
          <label for="pf-purchaseHead">구입두수</label>
          <input id="pf-purchaseHead" v-model="form.purchaseHeadCount" type="number" min="0" step="1" />
        </div>
        <div class="form-field">
          <label for="pf-purchaseUnit">구입 1두 가격</label>
          <input id="pf-purchaseUnit" v-model="form.purchaseUnitPrice" type="number" min="0" step="1" />
        </div>
        <div class="form-field">
          <label for="pf-currentHead">현재 두수</label>
          <input id="pf-currentHead" v-model="form.currentHeadCount" type="number" min="0" step="1" />
        </div>
        <div class="form-field">
          <label for="pf-unitSell">두수별 판매가</label>
          <input id="pf-unitSell" v-model="form.unitSellingPrice" type="number" min="0" step="1" />
        </div>
        <div class="form-field">
          <label for="pf-totalSell">총판매가</label>
          <input id="pf-totalSell" v-model="form.totalSellingPrice" type="number" min="0" step="1" />
        </div>
        <div class="form-field">
          <label for="pf-vendor">구입업체</label>
          <input id="pf-vendor" v-model="form.purchaseVendor" type="text" />
        </div>
        <div class="form-field">
          <label for="pf-farm">구입농장</label>
          <input id="pf-farm" v-model="form.purchaseFarm" type="text" placeholder="업체와 다를 수 있음" />
        </div>
        <div class="form-field">
          <label for="pf-purchaseDate">구매일</label>
          <input id="pf-purchaseDate" v-model="form.purchaseDate" type="date" />
        </div>
        <div class="form-field">
          <label for="pf-seedDate">파종일</label>
          <input id="pf-seedDate" v-model="form.seedDate" type="date" />
        </div>
        <div class="form-field">
          <label for="pf-pot">화분 크기</label>
          <input id="pf-pot" v-model="form.potSize" type="text" />
        </div>
        <div class="form-field form-field-wide">
          <label for="pf-memo">메모</label>
          <textarea id="pf-memo" v-model="form.memo" rows="3" />
        </div>
      </div>
      <p v-if="store.updateError" class="form-error">{{ store.updateError }}</p>
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!canSubmit" @click="handleSubmit">
        {{ store.updateLoading ? '저장 중...' : '저장' }}
      </BaseButton>
    </template>
  </Modal>
</template>

<style scoped>
.plant-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.form-field-wide {
  grid-column: 1 / -1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 600;
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
  font-family: inherit;
}

.form-field input:disabled {
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.form-loading {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-muted);
}

@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
