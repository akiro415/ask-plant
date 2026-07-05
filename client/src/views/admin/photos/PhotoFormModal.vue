<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { usePhotoStore } from '@/stores/photo';
import { usePlantStore } from '@/stores/plant';
import type { ImageType } from '@/types/image';
import { IMAGE_TYPE_LABEL } from '@/types/image';
import Modal from '@/components/common/Modal.vue';

const emit = defineEmits<{ close: []; saved: [] }>();

const store = usePhotoStore();
const plantStore = usePlantStore();

onMounted(async () => {
  await plantStore.ensurePlantsLoaded();
});

const form = reactive({
  plantId: plantStore.plants[0]?.id ?? '',
  url: '',
  imageType: 'OTHER' as ImageType,
  caption: '',
  isPrimary: false,
});

const imageTypeOptions = Object.entries(IMAGE_TYPE_LABEL) as [ImageType, string][];

const isValid = computed(() => form.plantId.length > 0 && form.url.trim().length > 0);
const canSubmit = computed(() => isValid.value && !store.formLoading);

async function handleSubmit() {
  if (!isValid.value) return;

  const ok = await store.createPhoto(form.plantId, {
    url: form.url.trim(),
    imageType: form.imageType,
    caption: form.caption.trim() ? form.caption.trim() : null,
    isPrimary: form.isPrimary,
  });

  if (ok) emit('saved');
}
</script>

<template>
  <Modal title="사진 등록" @close="emit('close')">
    <form class="photo-form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="pf-plantId">개체 <span class="required">*</span></label>
        <select id="pf-plantId" v-model="form.plantId" required>
          <option v-if="plantStore.plants.length === 0" value="" disabled>등록된 개체 없음</option>
          <option v-for="p in plantStore.plants" :key="p.id" :value="p.id">
            {{ p.qrCode }} · {{ p.species.displayName }}{{ p.nickname ? ` (${p.nickname})` : '' }}
          </option>
        </select>
      </div>

      <div class="form-field">
        <label for="pf-url">이미지 URL <span class="required">*</span></label>
        <input id="pf-url" v-model="form.url" type="text" placeholder="https://... 또는 /uploads/..." required />
        <p class="form-hint">파일 업로드 API는 미구현 — URL로 등록합니다.</p>
      </div>

      <div class="form-field">
        <label for="pf-imageType">유형</label>
        <select id="pf-imageType" v-model="form.imageType">
          <option v-for="[value, label] in imageTypeOptions" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>

      <div class="form-field">
        <label for="pf-caption">설명</label>
        <input id="pf-caption" v-model="form.caption" type="text" placeholder="선택 입력" />
      </div>

      <div class="form-field">
        <label class="form-checkbox-label" for="pf-isPrimary">
          <input id="pf-isPrimary" v-model="form.isPrimary" type="checkbox" />
          대표사진으로 설정
        </label>
      </div>

      <p v-if="store.formError" class="form-error">{{ store.formError }}</p>
    </form>

    <template #footer>
      <button type="button" class="btn btn-ghost" @click="emit('close')">취소</button>
      <button type="button" class="btn btn-primary" :disabled="!canSubmit" @click="handleSubmit">
        {{ store.formLoading ? '등록 중...' : '등록' }}
      </button>
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

.form-checkbox-label {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
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

.form-error {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.85rem;
}
</style>
