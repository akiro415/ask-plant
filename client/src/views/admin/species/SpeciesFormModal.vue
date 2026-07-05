<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useSpeciesStore } from '@/stores/species';
import type { Species, TaxonRank } from '@/types/species';
import { TAXON_RANK_LABEL } from '@/types/species';
import Modal from '@/components/common/Modal.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps<{ species: Species | null }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const store = useSpeciesStore();
const isEdit = computed(() => props.species !== null);

const form = reactive({
  displayName: props.species?.displayName ?? '',
  scientificName: props.species?.scientificName ?? '',
  englishName: props.species?.englishName ?? '',
  koreanName: props.species?.koreanName ?? '',
  fieldNumber: props.species?.fieldNumber ?? '',
  sellerName: props.species?.sellerName ?? '',
  categoryId: props.species?.category?.id ?? '',
  taxonRank: (props.species?.taxonRank ?? 'SPECIES') as TaxonRank,
  isHybrid: props.species?.isHybrid ?? false,
  parentSpecies1Id: props.species?.parentSpecies1Id ?? '',
  parentSpecies2Id: props.species?.parentSpecies2Id ?? '',
  genus: props.species?.genus ?? '',
  family: props.species?.family ?? '',
  careGuide: props.species?.careGuide ?? '',
  defaultWateringCycleDays: props.species?.defaultWateringCycleDays ?? ('' as number | string),
  thumbnailUrl: props.species?.thumbnailUrl ?? '',
});

const taxonRankOptions = Object.entries(TAXON_RANK_LABEL) as [TaxonRank, string][];

/** 수정 대상 자기 자신은 모본/부본으로 선택할 수 없다. */
const parentSpeciesOptions = computed(() =>
  store.speciesList.filter((s) => s.id !== props.species?.id),
);

const isValid = computed(() => form.displayName.trim().length > 0);
const canSubmit = computed(() => isValid.value && !store.formLoading);

function toNullable(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

async function handleSubmit() {
  if (!isValid.value) return;

  const payload = {
    displayName: form.displayName.trim(),
    scientificName: toNullable(form.scientificName),
    englishName: toNullable(form.englishName),
    koreanName: toNullable(form.koreanName),
    fieldNumber: toNullable(form.fieldNumber),
    sellerName: toNullable(form.sellerName),
    categoryId: form.categoryId ? form.categoryId : null,
    taxonRank: form.taxonRank,
    isHybrid: form.isHybrid,
    parentSpecies1Id: form.parentSpecies1Id ? form.parentSpecies1Id : null,
    parentSpecies2Id: form.parentSpecies2Id ? form.parentSpecies2Id : null,
    genus: toNullable(form.genus),
    family: toNullable(form.family),
    careGuide: toNullable(form.careGuide),
    defaultWateringCycleDays: form.defaultWateringCycleDays === '' ? null : Number(form.defaultWateringCycleDays),
    thumbnailUrl: toNullable(form.thumbnailUrl),
  };

  const ok = isEdit.value ? await store.updateSpecies(props.species!.id, payload) : await store.createSpecies(payload);

  if (ok) emit('saved');
}
</script>

<template>
  <Modal :title="isEdit ? '품종 수정' : '품종 등록'" :width-px="640" @close="emit('close')">
    <form class="species-form" @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-field form-field-wide">
          <label for="sf-displayName">유통명(displayName) <span class="required">*</span></label>
          <input id="sf-displayName" v-model="form.displayName" type="text" placeholder="예: 파티오라" required />
        </div>

        <div class="form-field">
          <label for="sf-scientificName">학명</label>
          <input id="sf-scientificName" v-model="form.scientificName" type="text" placeholder="예: Conophytum pageae" />
        </div>

        <div class="form-field">
          <label for="sf-koreanName">국문명</label>
          <input id="sf-koreanName" v-model="form.koreanName" type="text" />
        </div>

        <div class="form-field">
          <label for="sf-englishName">영문명</label>
          <input id="sf-englishName" v-model="form.englishName" type="text" />
        </div>

        <div class="form-field">
          <label for="sf-categoryId">카테고리</label>
          <select id="sf-categoryId" v-model="form.categoryId">
            <option value="">미분류</option>
            <option v-for="c in store.categoryChoices" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="sf-taxonRank">분류 계급</label>
          <select id="sf-taxonRank" v-model="form.taxonRank">
            <option v-for="[value, label] in taxonRankOptions" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>

        <div class="form-field">
          <label for="sf-fieldNumber">필드넘버</label>
          <input id="sf-fieldNumber" v-model="form.fieldNumber" type="text" placeholder="예: SB1234" />
        </div>

        <div class="form-field">
          <label for="sf-sellerName">판매자명</label>
          <input id="sf-sellerName" v-model="form.sellerName" type="text" />
        </div>

        <div class="form-field">
          <label for="sf-genus">속(genus)</label>
          <input id="sf-genus" v-model="form.genus" type="text" />
        </div>

        <div class="form-field">
          <label for="sf-family">과(family)</label>
          <input id="sf-family" v-model="form.family" type="text" />
        </div>

        <div class="form-field">
          <label for="sf-wateringCycle">기본 물주기(일)</label>
          <input id="sf-wateringCycle" v-model="form.defaultWateringCycleDays" type="number" min="1" placeholder="예: 14" />
        </div>

        <div class="form-field">
          <label class="form-checkbox-label" for="sf-isHybrid">
            <input id="sf-isHybrid" v-model="form.isHybrid" type="checkbox" />
            교배종 여부
          </label>
        </div>

        <div class="form-field">
          <label for="sf-parentSpecies1Id">모본 (parentSpecies1)</label>
          <select id="sf-parentSpecies1Id" v-model="form.parentSpecies1Id">
            <option value="">없음</option>
            <option v-for="s in parentSpeciesOptions" :key="s.id" :value="s.id">
              {{ s.displayName }}{{ s.scientificName ? ` (${s.scientificName})` : '' }}
            </option>
          </select>
        </div>

        <div class="form-field">
          <label for="sf-parentSpecies2Id">부본 (parentSpecies2)</label>
          <select id="sf-parentSpecies2Id" v-model="form.parentSpecies2Id">
            <option value="">없음</option>
            <option v-for="s in parentSpeciesOptions" :key="s.id" :value="s.id">
              {{ s.displayName }}{{ s.scientificName ? ` (${s.scientificName})` : '' }}
            </option>
          </select>
        </div>

        <div class="form-field form-field-wide">
          <label for="sf-thumbnailUrl">썸네일 이미지 URL</label>
          <input id="sf-thumbnailUrl" v-model="form.thumbnailUrl" type="text" placeholder="https://..." />
        </div>

        <div class="form-field form-field-wide">
          <label for="sf-careGuide">관리 가이드</label>
          <textarea id="sf-careGuide" v-model="form.careGuide" rows="3" placeholder="물주기/광량/월동 등 관리 방법을 입력하세요" />
        </div>
      </div>

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
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.25rem;
}

.form-field-wide {
  grid-column: 1 / -1;
}

@media (max-width: 560px) {
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

.form-checkbox-label {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
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

.form-field textarea {
  resize: vertical;
}
</style>
