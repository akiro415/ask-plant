import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useAuthStore } from './auth';
import { authApi, type UpdateMePayload } from '@/api/auth.api';
import { fetchSystemSettings, updateSystemSettings } from '@/api/settings.api';
import { fetchCollectorProfile, updateCollectorProfile } from '@/api/collector-profile.api';
import type { CollectorProfileDto } from '@/api/collector-profile.api';
import type { SystemSettings, UpdateSystemSettingsPayload } from '@/types/settings';
import { extractErrorMessage } from '@/api/http';

export const useSettingsStore = defineStore('settings', () => {
  const auth = useAuthStore();

  const profileLoading = ref(false);
  const profileError = ref<string | null>(null);
  const saveLoading = ref(false);
  const saveError = ref<string | null>(null);
  const saveSuccess = ref(false);

  const profileName = ref('');
  const profilePhone = ref('');

  const systemSettings = ref<SystemSettings | null>(null);
  const systemLoading = ref(false);
  const systemError = ref<string | null>(null);
  const systemSaveLoading = ref(false);
  const systemSaveError = ref<string | null>(null);
  const systemSaveSuccess = ref(false);

  const serviceName = ref('');
  const defaultLanguage = ref('ko');
  const defaultPlantStatusCode = ref('FOR_SALE');
  const notifyOrder = ref(true);
  const notifyLowStock = ref(true);
  const notifyWeeklyReport = ref(false);
  const qrCodeDigits = ref(6);
  const labelPaperSize = ref('40mm x 30mm');

  const collectorProfile = ref<CollectorProfileDto | null>(null);
  const collectorLoading = ref(false);
  const collectorError = ref<string | null>(null);
  const collectorSaveLoading = ref(false);
  const collectorSaveError = ref<string | null>(null);
  const collectorSaveSuccess = ref(false);

  const collectorNickname = ref('');
  const collectorBio = ref('');
  const collectorAvatarUrl = ref('');
  const collectorRegion = ref('');
  const collectorSnsUrl = ref('');
  const collectorBankAccountInfo = ref('');
  const collectorBankAccountHolder = ref('');
  const collectorBankPublic = ref(false);

  const user = computed(() => auth.user);
  const canEditSystem = computed(() => auth.hasRole('ADMIN'));
  const canViewSystem = computed(() => auth.hasRole('ADMIN', 'STAFF'));

  function applySystemForm(settings: SystemSettings) {
    serviceName.value = settings.serviceName;
    defaultLanguage.value = settings.defaultLanguage;
    defaultPlantStatusCode.value = settings.defaultPlantStatusCode;
    notifyOrder.value = settings.notifyOrder;
    notifyLowStock.value = settings.notifyLowStock;
    notifyWeeklyReport.value = settings.notifyWeeklyReport;
    qrCodeDigits.value = settings.qrCodeDigits;
    labelPaperSize.value = settings.labelPaperSize;
  }

  /** GET /collector-profile/me */
  async function loadCollectorProfile() {
    collectorLoading.value = true;
    collectorError.value = null;
    collectorSaveSuccess.value = false;
    try {
      const profile = await fetchCollectorProfile();
      collectorProfile.value = profile;
      collectorNickname.value = profile?.nickname ?? '';
      collectorBio.value = profile?.bio ?? '';
      collectorAvatarUrl.value = profile?.avatarUrl ?? '';
      collectorRegion.value = profile?.region ?? '';
      collectorSnsUrl.value = profile?.snsUrl ?? '';
      collectorBankAccountInfo.value = profile?.bankAccountInfo ?? '';
      collectorBankAccountHolder.value = profile?.bankAccountHolder ?? '';
      collectorBankPublic.value = profile?.bankPublic ?? false;
    } catch (error) {
      collectorError.value = extractErrorMessage(error, '컬렉터 프로필을 불러오지 못했습니다');
    } finally {
      collectorLoading.value = false;
    }
  }

  /** PUT /collector-profile/me */
  async function saveCollectorProfile(): Promise<boolean> {
    collectorSaveLoading.value = true;
    collectorSaveError.value = null;
    collectorSaveSuccess.value = false;
    try {
      const updated = await updateCollectorProfile({
        nickname: collectorNickname.value.trim() || null,
        bio: collectorBio.value.trim() || null,
        avatarUrl: collectorAvatarUrl.value.trim() || null,
        region: collectorRegion.value.trim() || null,
        snsUrl: collectorSnsUrl.value.trim() || null,
        bankAccountInfo: collectorBankAccountInfo.value.trim() || null,
        bankAccountHolder: collectorBankAccountHolder.value.trim() || null,
        bankPublic: collectorBankPublic.value,
      });
      collectorProfile.value = updated;
      collectorSaveSuccess.value = true;
      return true;
    } catch (error) {
      collectorSaveError.value = extractErrorMessage(error, '컬렉터 프로필 저장에 실패했습니다');
      return false;
    } finally {
      collectorSaveLoading.value = false;
    }
  }

  /** GET /auth/me */
  async function loadProfile() {
    profileLoading.value = true;
    profileError.value = null;
    saveSuccess.value = false;
    try {
      const me = await authApi.me();
      auth.syncUser(me);
      profileName.value = me.name;
      profilePhone.value = me.phone ?? '';
    } catch (error) {
      profileError.value = extractErrorMessage(error, '프로필을 불러오지 못했습니다');
      if (auth.user) {
        profileName.value = auth.user.name;
        profilePhone.value = auth.user.phone ?? '';
      }
    } finally {
      profileLoading.value = false;
    }
  }

  /** GET /settings */
  async function loadSystemSettings() {
    if (!canViewSystem.value) return;
    systemLoading.value = true;
    systemError.value = null;
    systemSaveSuccess.value = false;
    try {
      const settings = await fetchSystemSettings();
      systemSettings.value = settings;
      applySystemForm(settings);
    } catch (error) {
      systemError.value = extractErrorMessage(error, '시스템 설정을 불러오지 못했습니다');
    } finally {
      systemLoading.value = false;
    }
  }

  /** PUT /auth/me */
  async function saveProfile(): Promise<boolean> {
    saveLoading.value = true;
    saveError.value = null;
    saveSuccess.value = false;
    try {
      const payload: UpdateMePayload = {
        name: profileName.value.trim(),
        phone: profilePhone.value.trim() ? profilePhone.value.trim() : null,
      };
      const updated = await authApi.updateMe(payload);
      auth.syncUser(updated);
      profileName.value = updated.name;
      profilePhone.value = updated.phone ?? '';
      saveSuccess.value = true;
      return true;
    } catch (error) {
      saveError.value = extractErrorMessage(error, '프로필 저장에 실패했습니다');
      return false;
    } finally {
      saveLoading.value = false;
    }
  }

  /** PUT /settings */
  async function saveSystemSettings(): Promise<boolean> {
    if (!canEditSystem.value) return false;
    systemSaveLoading.value = true;
    systemSaveError.value = null;
    systemSaveSuccess.value = false;
    try {
      const payload: UpdateSystemSettingsPayload = {
        serviceName: serviceName.value.trim(),
        defaultLanguage: defaultLanguage.value.trim(),
        defaultPlantStatusCode: defaultPlantStatusCode.value,
        notifyOrder: notifyOrder.value,
        notifyLowStock: notifyLowStock.value,
        notifyWeeklyReport: notifyWeeklyReport.value,
        qrCodeDigits: qrCodeDigits.value,
        labelPaperSize: labelPaperSize.value,
      };
      const updated = await updateSystemSettings(payload);
      systemSettings.value = updated;
      applySystemForm(updated);
      systemSaveSuccess.value = true;
      return true;
    } catch (error) {
      systemSaveError.value = extractErrorMessage(error, '시스템 설정 저장에 실패했습니다');
      return false;
    } finally {
      systemSaveLoading.value = false;
    }
  }

  return {
    user,
    profileName,
    profilePhone,
    profileLoading,
    profileError,
    saveLoading,
    saveError,
    saveSuccess,
    systemSettings,
    systemLoading,
    systemError,
    systemSaveLoading,
    systemSaveError,
    systemSaveSuccess,
    serviceName,
    defaultLanguage,
    defaultPlantStatusCode,
    notifyOrder,
    notifyLowStock,
    notifyWeeklyReport,
    qrCodeDigits,
    labelPaperSize,
    collectorProfile,
    collectorLoading,
    collectorError,
    collectorSaveLoading,
    collectorSaveError,
    collectorSaveSuccess,
    collectorNickname,
    collectorBio,
    collectorAvatarUrl,
    collectorRegion,
    collectorSnsUrl,
    collectorBankAccountInfo,
    collectorBankAccountHolder,
    collectorBankPublic,
    canEditSystem,
    canViewSystem,
    loadProfile,
    loadCollectorProfile,
    loadSystemSettings,
    saveProfile,
    saveCollectorProfile,
    saveSystemSettings,
  };
});

