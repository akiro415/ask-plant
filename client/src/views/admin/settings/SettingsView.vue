<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useCommonCodeStore } from '@/stores/common-code';
import { USER_ROLE_LABEL } from '@/types/user';
import PageHeader from '@/components/common/PageHeader.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';

const store = useSettingsStore();
const commonCode = useCommonCodeStore();

const plantStatusOptions = computed(() =>
  commonCode.codes.filter((c) => c.groupCode === 'PLANT_STATUS').sort((a, b) => a.sortOrder - b.sortOrder),
);

const labelPaperOptions = ['40mm x 30mm', '50mm x 30mm', '60mm x 40mm'];

onMounted(async () => {
  await Promise.all([store.loadProfile(), commonCode.ensureLoaded()]);
  await store.loadSystemSettings();
});

async function handleSaveProfile() {
  await store.saveProfile();
}

async function handleSaveSystem() {
  await store.saveSystemSettings();
}
</script>

<template>
  <div>
    <PageHeader title="설정" subtitle="내 계정과 시스템 기본값을 관리합니다." />

    <div class="settings-grid">
      <section class="panel">
        <h2 class="panel-section-title">내 계정</h2>

        <div v-if="store.profileLoading" class="section-loading">
          <EmptyState message="프로필을 불러오는 중입니다..." icon="⏳" />
        </div>
        <div v-else-if="store.profileError" class="section-loading">
          <EmptyState :message="store.profileError" icon="⚠️" />
          <div class="section-actions">
            <BaseButton variant="outline" size="sm" @click="store.loadProfile">다시 시도</BaseButton>
          </div>
        </div>
        <template v-else>
          <div class="editable-fields">
            <BaseInput id="profile-name" v-model="store.profileName" label="이름" />
            <BaseInput id="profile-email" :model-value="store.user?.email ?? ''" label="이메일" disabled />
            <BaseInput id="profile-phone" v-model="store.profilePhone" label="연락처" placeholder="010-0000-0000" />
            <BaseInput
              id="profile-role"
              :model-value="store.user ? USER_ROLE_LABEL[store.user.role] : ''"
              label="역할"
              disabled
            />
          </div>

          <p v-if="store.saveError" class="form-error">{{ store.saveError }}</p>
          <p v-if="store.saveSuccess" class="form-success">프로필이 저장되었습니다.</p>

          <div class="section-actions">
            <BaseButton variant="primary" size="sm" :disabled="store.saveLoading" @click="handleSaveProfile">
              {{ store.saveLoading ? '저장 중...' : '프로필 저장' }}
            </BaseButton>
          </div>
        </template>
      </section>

      <section v-if="store.canViewSystem" class="panel">
        <h2 class="panel-section-title">시스템 설정</h2>

        <div v-if="store.systemLoading" class="section-loading">
          <EmptyState message="시스템 설정을 불러오는 중입니다..." icon="⏳" />
        </div>
        <div v-else-if="store.systemError" class="section-loading">
          <EmptyState :message="store.systemError" icon="⚠️" />
          <div class="section-actions">
            <BaseButton variant="outline" size="sm" @click="store.loadSystemSettings">다시 시도</BaseButton>
          </div>
        </div>
        <template v-else>
          <p v-if="!store.canEditSystem" class="section-note">STAFF는 조회만 가능합니다. 수정은 ADMIN만 할 수 있습니다.</p>

          <div class="settings-subsection">
            <h3 class="subsection-title">기본값</h3>
            <div class="editable-fields">
              <BaseInput
                id="service-name"
                v-model="store.serviceName"
                label="농장/매장 이름"
                :disabled="!store.canEditSystem"
              />
              <BaseSelect id="default-language" v-model="store.defaultLanguage" label="기본 언어" :disabled="!store.canEditSystem">
                <option value="ko">한국어 (ko)</option>
                <option value="en">English (en)</option>
              </BaseSelect>
              <BaseSelect
                id="default-plant-status"
                v-model="store.defaultPlantStatusCode"
                label="기본 Plant 상태"
                :disabled="!store.canEditSystem"
              >
                <option v-for="status in plantStatusOptions" :key="status.code" :value="status.code">
                  {{ status.name }}
                </option>
              </BaseSelect>
            </div>
          </div>

          <div class="settings-subsection">
            <h3 class="subsection-title">QR / 라벨</h3>
            <p class="section-note">QR은 개체 등록 시 자동 발급됩니다 (Species.category.code + QrSequence).</p>
            <div class="editable-fields">
              <BaseInput
                id="qr-digits"
                v-model="store.qrCodeDigits"
                type="number"
                label="QR 코드 자릿수"
                :disabled="!store.canEditSystem"
              />
              <BaseSelect
                id="label-paper"
                v-model="store.labelPaperSize"
                label="라벨 용지 규격"
                :disabled="!store.canEditSystem"
              >
                <option v-for="size in labelPaperOptions" :key="size" :value="size">{{ size }}</option>
              </BaseSelect>
            </div>
          </div>

          <div class="settings-subsection">
            <h3 class="subsection-title">알림</h3>
            <p class="section-note">알림 발송 연동은 추후 구현 예정입니다. 설정값만 저장됩니다.</p>
            <div class="checkbox-group">
              <label class="form-checkbox">
                <input v-model="store.notifyOrder" type="checkbox" :disabled="!store.canEditSystem" />
                신규 주문/문의 알림 받기
              </label>
              <label class="form-checkbox">
                <input v-model="store.notifyLowStock" type="checkbox" :disabled="!store.canEditSystem" />
                재고 부족 알림 받기
              </label>
              <label class="form-checkbox">
                <input v-model="store.notifyWeeklyReport" type="checkbox" :disabled="!store.canEditSystem" />
                주간 리포트 이메일 받기
              </label>
            </div>
          </div>

          <p v-if="store.systemSaveError" class="form-error">{{ store.systemSaveError }}</p>
          <p v-if="store.systemSaveSuccess" class="form-success">시스템 설정이 저장되었습니다.</p>

          <div v-if="store.canEditSystem" class="section-actions">
            <BaseButton variant="primary" size="sm" :disabled="store.systemSaveLoading" @click="handleSaveSystem">
              {{ store.systemSaveLoading ? '저장 중...' : '시스템 설정 저장' }}
            </BaseButton>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-5);
}

.panel-section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.subsection-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.settings-subsection {
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.settings-subsection:last-of-type {
  border-bottom: none;
  margin-bottom: var(--space-3);
}

.section-note {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  margin: calc(var(--space-1) * -1) 0 var(--space-3);
}

.editable-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.85rem;
  color: var(--color-text);
}

.section-loading {
  padding: var(--space-2) 0;
}

.section-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-3);
}

.form-success {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-success-bg, #e8f5e9);
  color: var(--color-success, #2e7d32);
  font-size: 0.82rem;
  margin-bottom: var(--space-2);
}
</style>
