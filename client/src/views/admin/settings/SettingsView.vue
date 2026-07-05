<script setup lang="ts">

import { computed, onMounted } from 'vue';

import { useSettingsStore } from '@/stores/settings';

import { useCommonCodeStore } from '@/stores/common-code';

import { USER_ROLE_LABEL } from '@/types/user';

import PageHeader from '@/components/common/PageHeader.vue';

import EmptyState from '@/components/common/EmptyState.vue';
import BaseButton from '@/components/base/BaseButton.vue';

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

        <h2 class="info-card-title">내 계정</h2>

        <div v-if="store.profileLoading" class="section-loading">

          <EmptyState message="프로필을 불러오는 중입니다..." icon="⏳" />

        </div>

        <div v-else-if="store.profileError" class="section-loading">

          <EmptyState :message="store.profileError" icon="⚠️" />

          <div class="section-actions"><BaseButton variant="outline" size="sm" @click="store.loadProfile">다시 시도</BaseButton></div>

        </div>

        <template v-else>

          <label class="form-field">

            <span>이름</span>

            <input v-model="store.profileName" type="text" />

          </label>

          <label class="form-field">

            <span>이메일</span>

            <input type="email" :value="store.user?.email ?? ''" disabled />

          </label>

          <label class="form-field">

            <span>연락처</span>

            <input v-model="store.profilePhone" type="text" placeholder="010-0000-0000" />

          </label>

          <label class="form-field">

            <span>역할</span>

            <input type="text" :value="store.user ? USER_ROLE_LABEL[store.user.role] : ''" disabled />

          </label>

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

        <h2 class="info-card-title">시스템 설정</h2>

        <div v-if="store.systemLoading" class="section-loading">

          <EmptyState message="시스템 설정을 불러오는 중입니다..." icon="⏳" />

        </div>

        <div v-else-if="store.systemError" class="section-loading">

          <EmptyState :message="store.systemError" icon="⚠️" />

          <div class="section-actions"><BaseButton variant="outline" size="sm" @click="store.loadSystemSettings">다시 시도</BaseButton></div>

        </div>

        <template v-else>

          <p v-if="!store.canEditSystem" class="section-note">STAFF는 조회만 가능합니다. 수정은 ADMIN만 할 수 있습니다.</p>

          <label class="form-field">

            <span>농장/매장 이름</span>

            <input v-model="store.serviceName" type="text" :disabled="!store.canEditSystem" />

          </label>

          <label class="form-field">

            <span>기본 언어</span>

            <select v-model="store.defaultLanguage" :disabled="!store.canEditSystem">

              <option value="ko">한국어 (ko)</option>

              <option value="en">English (en)</option>

            </select>

          </label>

          <label class="form-field">

            <span>기본 Plant 상태</span>

            <select v-model="store.defaultPlantStatusCode" :disabled="!store.canEditSystem">

              <option v-for="status in plantStatusOptions" :key="status.code" :value="status.code">{{ status.name }}</option>

            </select>

          </label>

          <p v-if="store.systemSaveError" class="form-error">{{ store.systemSaveError }}</p>

          <p v-if="store.systemSaveSuccess" class="form-success">시스템 설정이 저장되었습니다.</p>

          <div v-if="store.canEditSystem" class="section-actions">

            <BaseButton variant="primary" size="sm" :disabled="store.systemSaveLoading" @click="handleSaveSystem">

              {{ store.systemSaveLoading ? '저장 중...' : '시스템 설정 저장' }}

            </BaseButton>

          </div>

        </template>

      </section>



      <section v-if="store.canViewSystem" class="panel">

        <h2 class="info-card-title">QR / 라벨</h2>

        <p class="section-note">QR은 개체 등록 시 자동 발급됩니다 (Species.category.code + QrSequence).</p>

        <label class="form-field">

          <span>QR 코드 자릿수</span>

          <input v-model.number="store.qrCodeDigits" type="number" min="4" max="10" :disabled="!store.canEditSystem" />

        </label>

        <label class="form-field">

          <span>라벨 용지 규격</span>

          <select v-model="store.labelPaperSize" :disabled="!store.canEditSystem">

            <option v-for="size in labelPaperOptions" :key="size" :value="size">{{ size }}</option>

          </select>

        </label>

        <div v-if="store.canEditSystem" class="section-actions">

          <BaseButton variant="primary" size="sm" :disabled="store.systemSaveLoading" @click="handleSaveSystem">

            {{ store.systemSaveLoading ? '저장 중...' : 'QR 설정 저장' }}

          </BaseButton>

        </div>

      </section>



      <section v-if="store.canViewSystem" class="panel">

        <h2 class="info-card-title">알림</h2>

        <p class="section-note">알림 발송 연동은 추후 구현 예정입니다. 설정값만 저장됩니다.</p>

        <label class="form-checkbox">

          <input v-model="store.notifyOrder" type="checkbox" :disabled="!store.canEditSystem" /> 신규 주문/문의 알림 받기

        </label>

        <label class="form-checkbox">

          <input v-model="store.notifyLowStock" type="checkbox" :disabled="!store.canEditSystem" /> 재고 부족 알림 받기

        </label>

        <label class="form-checkbox">

          <input v-model="store.notifyWeeklyReport" type="checkbox" :disabled="!store.canEditSystem" /> 주간 리포트 이메일 받기

        </label>

        <div v-if="store.canEditSystem" class="section-actions">

          <BaseButton variant="primary" size="sm" :disabled="store.systemSaveLoading" @click="handleSaveSystem">

            {{ store.systemSaveLoading ? '저장 중...' : '알림 설정 저장' }}

          </BaseButton>

        </div>

      </section>

    </div>

  </div>

</template>



<style scoped>

.settings-grid {

  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

  gap: 1.25rem;

  margin-bottom: 1.25rem;

}



.info-card-title {

  font-size: 0.95rem;

  font-weight: 700;

  color: var(--color-text);

  margin-bottom: 0.9rem;

}



.section-note {

  font-size: 0.76rem;

  color: var(--color-text-muted);

  margin: -0.4rem 0 0.9rem;

}



.form-field {

  display: flex;

  flex-direction: column;

  gap: 0.35rem;

  font-size: 0.82rem;

  color: var(--color-text-muted);

  margin-bottom: 0.9rem;

}



.form-field input,

.form-field select {

  padding: 0.5rem 0.7rem;

  border: 1px solid var(--color-border);

  border-radius: 8px;

  font-size: 0.88rem;

  color: var(--color-text);

}



.form-field input:disabled,

.form-field select:disabled {

  background: var(--color-bg);

  color: var(--color-text-muted);

}



.form-checkbox {

  display: flex;

  align-items: center;

  gap: 0.5rem;

  font-size: 0.85rem;

  margin-bottom: 0.6rem;

  color: var(--color-text);

}



.section-loading {

  padding: 0.5rem 0;

}



.section-actions {

  display: flex;

  justify-content: flex-end;

  margin-top: 0.5rem;

}



.form-success {

  padding: 0.5rem 0.75rem;

  border-radius: 8px;

  background: var(--color-success-bg, #e8f5e9);

  color: var(--color-success, #2e7d32);

  font-size: 0.82rem;

  margin-bottom: 0.5rem;

}

</style>


