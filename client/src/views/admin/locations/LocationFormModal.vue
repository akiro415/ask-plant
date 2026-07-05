<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useLocationStore } from '@/stores/location';
import type { PlantLocation } from '@/types/location';
import Modal from '@/components/common/Modal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseAutocomplete from '@/components/base/BaseAutocomplete.vue';

const props = defineProps<{ location: PlantLocation | null }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const store = useLocationStore();
const isEdit = computed(() => props.location !== null);

onMounted(() => {
  store.ensureTypeOptionsLoaded();
});

const form = reactive({
  code: props.location?.code ?? '',
  name: props.location?.name ?? '',
  typeId: props.location?.type?.id ?? '',
  parentId: props.location?.parentId ?? '',
  imagePath: props.location?.imagePath ?? '',
  posX: props.location?.posX ?? ('' as number | string),
  posY: props.location?.posY ?? ('' as number | string),
});

/** 계층 구조 무결성 — 자기 자신은 상위 위치로 선택할 수 없도록 목록에서 제외한다(1차 차단, 순환 참조는 서버가 최종 검증). */
const parentOptions = computed(() => store.locations.filter((l) => l.id !== props.location?.id));

const typeAutocompleteOptions = computed(() =>
  store.typeOptions.map((t) => ({ value: t.id, label: t.name, keywords: t.code })),
);

const parentAutocompleteOptions = computed(() =>
  parentOptions.value.map((p) => ({
    value: p.id,
    label: `${'　'.repeat(p.depth)}${p.depth > 0 ? '└ ' : ''}${p.name}`,
    keywords: [p.name, p.code].join(' '),
  })),
);

const isValid = computed(() => form.code.trim().length > 0 && form.name.trim().length > 0);
const canSubmit = computed(() => isValid.value && !store.formLoading);

function toNullableString(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

function toNullableUnitCoord(value: number | string): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n;
}

async function handleSubmit() {
  if (!isValid.value) return;

  const posX = toNullableUnitCoord(form.posX);
  const posY = toNullableUnitCoord(form.posY);

  const payload = {
    code: form.code.trim(),
    name: form.name.trim(),
    typeId: form.typeId ? form.typeId : null,
    parentId: form.parentId ? form.parentId : null,
    imagePath: toNullableString(form.imagePath),
    posX,
    posY,
  };

  const ok = isEdit.value ? await store.updateLocation(props.location!.id, payload) : await store.createLocation(payload);

  if (ok) emit('saved');
}
</script>

<template>
  <Modal :title="isEdit ? '위치 수정' : '위치 등록'" @close="emit('close')">
    <form class="location-form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="lf-code">위치 코드 <span class="required">*</span></label>
        <input id="lf-code" v-model="form.code" type="text" placeholder="예: GH-A" required />
      </div>

      <div class="form-field">
        <label for="lf-name">위치명 <span class="required">*</span></label>
        <input id="lf-name" v-model="form.name" type="text" placeholder="예: 온실 A동" required />
      </div>

      <BaseAutocomplete
        id="lf-typeId"
        v-model="form.typeId"
        label="위치 유형"
        :options="typeAutocompleteOptions"
        nullable
        empty-label="미지정"
        placeholder="유형 검색"
      />
      <BaseAutocomplete
        id="lf-parentId"
        v-model="form.parentId"
        label="상위 위치"
        :options="parentAutocompleteOptions"
        nullable
        empty-label="없음 (최상위)"
        placeholder="상위 위치 검색"
      />
      <p v-if="isEdit" class="form-hint">자기 자신은 상위 위치로 선택할 수 없습니다.</p>

      <div class="form-field">
        <label for="lf-imagePath">배치도 이미지 경로</label>
        <input id="lf-imagePath" v-model="form.imagePath" type="text" placeholder="예: /uploads/locations/greenhouse-a.png" />
        <p class="form-hint">향후 지도/배치도 기능에서 사용할 이미지 URL 또는 경로입니다.</p>
      </div>

      <div class="form-field-row">
        <div class="form-field">
          <label for="lf-posX">X 좌표 (0~1)</label>
          <input id="lf-posX" v-model="form.posX" type="number" min="0" max="1" step="0.01" placeholder="예: 0.35" />
        </div>
        <div class="form-field">
          <label for="lf-posY">Y 좌표 (0~1)</label>
          <input id="lf-posY" v-model="form.posY" type="number" min="0" max="1" step="0.01" placeholder="예: 0.62" />
        </div>
      </div>
      <p class="form-hint form-hint-block">좌표는 배치도 이미지 기준 상대 위치(0~1)입니다. 비워두면 저장되지 않습니다.</p>

      <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
    </form>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!canSubmit" @click="handleSubmit">
        {{ store.formLoading ? '저장 중...' : isEdit ? '수정' : '등록' }}
      </BaseButton>
    </template>
  </Modal>
</template>

<style scoped>
.location-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
.form-field select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.88rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
}

.form-hint {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.form-hint-block {
  margin-top: -0.35rem;
}

.form-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .form-field-row {
    grid-template-columns: 1fr;
  }
}
</style>
