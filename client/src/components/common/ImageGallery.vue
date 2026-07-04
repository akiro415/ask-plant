<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PlantImage } from '@/types/image';
import { IMAGE_TYPE_LABEL } from '@/types/image';

const props = withDefaults(
  defineProps<{
    images: PlantImage[];
    variant?: 'admin' | 'public';
  }>(),
  { variant: 'admin' },
);

const activeIndex = ref(0);

watch(
  () => props.images,
  () => {
    activeIndex.value = 0;
  },
);

const active = computed(() => props.images[activeIndex.value] ?? null);
const mainClass = computed(() => (props.variant === 'public' ? 'public-gallery' : 'image-gallery-main'));
const thumbsClass = computed(() => (props.variant === 'public' ? 'public-thumbs' : 'image-gallery-thumbs'));
const thumbClass = computed(() => (props.variant === 'public' ? 'public-thumb' : 'image-gallery-thumb'));
</script>

<template>
  <div>
    <div :class="mainClass">
      <img v-if="active" :src="active.url" :alt="active.caption ?? ''" />
    </div>
    <div v-if="images.length > 1" :class="thumbsClass">
      <button
        v-for="(img, i) in images"
        :key="img.id"
        type="button"
        :class="[thumbClass, { active: i === activeIndex }]"
        :title="IMAGE_TYPE_LABEL[img.imageType]"
        @click="activeIndex = i"
      >
        <img :src="img.url" alt="" />
      </button>
    </div>
  </div>
</template>
