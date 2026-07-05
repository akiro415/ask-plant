<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import type { AutocompleteOption } from '@/types/autocomplete';

type FieldSize = 'sm' | 'md' | 'lg';

const model = defineModel<string>({ default: '' });

const props = withDefaults(
  defineProps<{
    id?: string;
    options: AutocompleteOption[];
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
    size?: FieldSize;
    /** 빈 값(미선택) 허용 */
    nullable?: boolean;
    emptyLabel?: string;
    /** FilterBar 등 컴팩트 표시 */
    variant?: 'field' | 'filter';
    minWidth?: string;
  }>(),
  {
    required: false,
    disabled: false,
    size: 'md',
    nullable: false,
    emptyLabel: '선택 안 함',
    variant: 'field',
    minWidth: '160px',
  },
);

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const open = ref(false);
const query = ref('');
const activeIndex = ref(-1);

const allOptions = computed<AutocompleteOption[]>(() => {
  if (!props.nullable) return props.options;
  return [{ value: '', label: props.emptyLabel }, ...props.options];
});

const selectedOption = computed(() => allOptions.value.find((o) => o.value === model.value) ?? null);

const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return allOptions.value;
  return allOptions.value.filter((opt) => {
    const haystack = [opt.label, opt.value, opt.keywords ?? ''].join(' ').toLowerCase();
    return haystack.includes(q);
  });
});

const displayPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder;
  return selectedOption.value?.label ?? '검색하여 선택';
});

function optionMatches(opt: AutocompleteOption, q: string): boolean {
  const haystack = [opt.label, opt.value, opt.keywords ?? ''].join(' ').toLowerCase();
  return haystack.includes(q);
}

function syncQueryFromModel() {
  query.value = selectedOption.value?.label ?? '';
}

function openDropdown() {
  if (props.disabled) return;
  open.value = true;
  activeIndex.value = filteredOptions.value.findIndex((o) => o.value === model.value);
  nextTick(() => inputRef.value?.select());
}

function closeDropdown() {
  open.value = false;
  activeIndex.value = -1;
  syncQueryFromModel();
}

function selectOption(opt: AutocompleteOption) {
  model.value = opt.value;
  query.value = opt.label;
  closeDropdown();
}

function onInput() {
  open.value = true;
  activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1;
}

function onFocus() {
  openDropdown();
}

function onBlur() {
  window.setTimeout(() => {
    if (!rootRef.value?.contains(document.activeElement)) {
      const q = query.value.trim().toLowerCase();
      if (!q) {
        syncQueryFromModel();
        closeDropdown();
        return;
      }
      const exact = allOptions.value.find(
        (opt) => opt.label.toLowerCase() === q || opt.value.toLowerCase() === q,
      );
      const partial = allOptions.value.find((opt) => optionMatches(opt, q));
      if (exact) {
        selectOption(exact);
      } else if (partial && filteredOptions.value.length === 1) {
        selectOption(partial);
      } else {
        syncQueryFromModel();
        closeDropdown();
      }
    }
  }, 120);
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value && (event.key === 'ArrowDown' || event.key === 'Enter')) {
    openDropdown();
    event.preventDefault();
    return;
  }

  if (event.key === 'Escape') {
    closeDropdown();
    inputRef.value?.blur();
    return;
  }

  if (!open.value) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (filteredOptions.value.length === 0) return;
    activeIndex.value = (activeIndex.value + 1) % filteredOptions.value.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (filteredOptions.value.length === 0) return;
    activeIndex.value = (activeIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const opt = filteredOptions.value[activeIndex.value];
    if (opt) selectOption(opt);
  }
}

function onDocumentPointerDown(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) {
    closeDropdown();
  }
}

watch(
  () => model.value,
  () => {
    if (!open.value) syncQueryFromModel();
  },
  { immediate: true },
);

watch(
  () => props.options,
  () => {
    if (!open.value) syncQueryFromModel();
  },
);

document.addEventListener('mousedown', onDocumentPointerDown);
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentPointerDown));
</script>

<template>
  <div
    ref="rootRef"
    class="base-autocomplete"
    :class="[
      `base-autocomplete--${size}`,
      `base-autocomplete--${variant}`,
      { 'base-autocomplete--open': open, 'base-autocomplete--error': !!error, 'base-autocomplete--disabled': disabled },
    ]"
    :style="variant === 'filter' ? { minWidth } : undefined"
  >
    <label v-if="label && variant === 'field'" :for="id" class="base-field__label">
      {{ label }}
      <span v-if="required" class="base-field__required">*</span>
    </label>

    <div class="base-autocomplete__control">
      <input
        :id="id"
        ref="inputRef"
        v-model="query"
        type="text"
        class="base-autocomplete__input"
        :placeholder="displayPlaceholder"
        :required="required && !nullable"
        :disabled="disabled"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="open"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown="onKeydown"
      />
      <span class="base-autocomplete__chevron" aria-hidden="true">▾</span>
    </div>

    <ul v-if="open && filteredOptions.length > 0" class="base-autocomplete__list" role="listbox">
      <li
        v-for="(opt, index) in filteredOptions"
        :key="opt.value || '__empty__'"
        class="base-autocomplete__option"
        :class="{
          'base-autocomplete__option--active': index === activeIndex,
          'base-autocomplete__option--selected': opt.value === model,
        }"
        role="option"
        :aria-selected="opt.value === model"
        @mousedown.prevent="selectOption(opt)"
      >
        {{ opt.label }}
      </li>
    </ul>
    <p v-else-if="open && query.trim()" class="base-autocomplete__empty">검색 결과가 없습니다</p>

    <p v-if="error && variant === 'field'" class="base-field__error">{{ error }}</p>
    <p v-else-if="hint && variant === 'field'" class="base-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.base-autocomplete {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.base-autocomplete--field {
  width: 100%;
}

.base-field__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.base-field__required {
  color: var(--color-danger);
}

.base-autocomplete__control {
  position: relative;
}

.base-autocomplete__input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: inherit;
  padding-right: 1.75rem;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.base-autocomplete__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.base-autocomplete--error .base-autocomplete__input,
.base-autocomplete--error .base-autocomplete__input:focus {
  border-color: var(--color-danger);
  box-shadow: var(--focus-ring-danger);
}

.base-autocomplete--disabled .base-autocomplete__input {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.base-autocomplete--sm .base-autocomplete__input {
  height: var(--input-height-sm);
  padding-left: var(--space-3);
  font-size: 0.8125rem;
}

.base-autocomplete--md .base-autocomplete__input {
  height: var(--input-height-md);
  padding-left: var(--space-3);
  font-size: 0.875rem;
}

.base-autocomplete--lg .base-autocomplete__input {
  height: var(--input-height-lg);
  padding-left: var(--space-4);
  font-size: 0.9375rem;
}

.base-autocomplete__chevron {
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

.base-autocomplete__list {
  position: absolute;
  z-index: 40;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  max-height: 240px;
  overflow-y: auto;
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.12));
}

.base-autocomplete--filter .base-autocomplete__list {
  min-width: 100%;
}

.base-autocomplete__option {
  padding: 0.55rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--color-text-primary);
}

.base-autocomplete__option:hover,
.base-autocomplete__option--active {
  background: var(--color-primary-soft, rgba(46, 125, 50, 0.08));
}

.base-autocomplete__option--selected {
  font-weight: 600;
  color: var(--color-primary);
}

.base-autocomplete__empty {
  position: absolute;
  z-index: 40;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  margin: 0;
  padding: 0.65rem 0.75rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.base-field__error {
  font-size: 0.75rem;
  color: var(--color-danger);
}

.base-field__hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
