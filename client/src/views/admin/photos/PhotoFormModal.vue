<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import { usePhotoStore } from '@/stores/photo';
import { usePlantStore } from '@/stores/plant';
import type { ImageApiRow } from '@/api/image.api';
import type { ImageType } from '@/types/image';
import { IMAGE_TYPE_LABEL } from '@/types/image';
import Modal from '@/components/common/Modal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseAutocomplete from '@/components/base/BaseAutocomplete.vue';
import BaseSwitch from '@/components/base/BaseSwitch.vue';

const props = defineProps<{ image?: ImageApiRow | null }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const store = usePhotoStore();
const plantStore = usePlantStore();
const isEdit = computed(() => Boolean(props.image));

onMounted(async () => {
  await plantStore.ensurePlantsLoaded();
});

const form = reactive({
  plantId: props.image?.plantId ?? plantStore.plants[0]?.id ?? '',
  url: props.image?.url ?? '',
  imageType: (props.image?.imageType ?? 'OTHER') as ImageType,
  caption: props.image?.caption ?? '',
  isPrimary: props.image?.isPrimary ?? false,
});

watch(
  () => props.image,
  (image) => {
    if (!image) return;
    form.plantId = image.plantId;
    form.url = image.url;
    form.imageType = image.imageType;
    form.caption = image.caption ?? '';
    form.isPrimary = image.isPrimary;
  },
);

const imageTypeOptions = Object.entries(IMAGE_TYPE_LABEL) as [ImageType, string][];

const plantAutocompleteOptions = computed(() =>
  plantStore.plants.map((p) => ({
    value: p.id,
    label: `${p.qrCode} · ${p.species.displayName}${p.nickname ? ` (${p.nickname})` : ''}`,
    keywords: [p.qrCode, p.species.displayName, p.nickname ?? ''].join(' '),
  })),
);

const imageTypeAutocompleteOptions = computed(() =>
  imageTypeOptions.map(([value, label]) => ({ value, label })),
);

const isValid = computed(() => form.plantId.length > 0 && form.url.trim().length > 0);
const canSubmit = computed(() => isValid.value && !store.formLoading);

async function handleSubmit() {
  if (!isValid.value) return;

  const payload = {
    url: form.url.trim(),
    imageType: form.imageType,
    caption: form.caption.trim() ? form.caption.trim() : null,
    isPrimary: form.isPrimary,
  };

  const ok =
    isEdit.value && props.image
      ? await store.updatePhoto(props.image.id, payload)
      : await store.createPhoto(form.plantId, payload);

  if (ok) emit('saved');
}
</script>

<template>
  <Modal :title="isEdit ? '사진 수정' : '사진 등록'" @close="emit('close')">
    <form class="photo-form" @submit.prevent="handleSubmit">
      <BaseAutocomplete
        v-if="!isEdit"
        id="pf-plantId"
        v-model="form.plantId"
        label="개체"
        required
        :options="plantAutocompleteOptions"
        placeholder="QR·품종 검색"
      />
      <div v-else class="form-field">
        <label>개체</label>
        <input type="text" :value="`${props.image?.plant.qrCode} · ${props.image?.plant.displayName}`" disabled />
      </div>

      <div class="form-field">
        <label for="pf-url">이미지 URL <span class="required">*</span></label>
        <input id="pf-url" v-model="form.url" type="text" placeholder="https://..." required />
      </div>

      <BaseAutocomplete id="pf-imageType" v-model="form.imageType" label="유형" :options="imageTypeAutocompleteOptions" placeholder="유형 선택" />

      <div class="form-field">
        <label for="pf-caption">설명</label>
        <input id="pf-caption" v-model="form.caption" type="text" placeholder="선택 입력" />
      </div>

      <BaseSwitch id="pf-isPrimary" v-model="form.isPrimary" label="대표사진으로 설정" />

      <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
    </form>

    <template #footer>
      <BaseButton variant="ghost" @click="emit('close')">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!canSubmit" @click="handleSubmit">
        {{ store.formLoading ? '저장 중...' : isEdit ? '저장' : '등록' }}
      </BaseButton>
    </template>
  </Modal>
</template>

<style scoped>
.photo-form {
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

.form-field input:disabled {
  background: var(--color-bg);
  color: var(--color-text-muted);
}
</style>
