import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authApi, type AuthUser } from '@/api/auth.api';
import { getStoredAccessToken, setStoredAccessToken, clearStoredAccessToken, extractErrorMessage } from '@/api/http';

const USER_STORAGE_KEY = 'ask-plant.user';

function loadStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getStoredAccessToken());
  const user = ref<AuthUser | null>(loadStoredUser());
  const loginLoading = ref(false);
  const loginError = ref<string | null>(null);
  const meLoading = ref(false);
  const meChecked = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value));
  /** ADMIN/STAFF/CUSTOMER 역할 확장을 대비한 헬퍼 — role 기반 라우터/UI 분기에서 재사용한다. */
  const hasRole = (...roles: AuthUser['role'][]) => Boolean(user.value && roles.includes(user.value.role));

  function setSession(nextToken: string, nextUser: AuthUser) {
    token.value = nextToken;
    user.value = nextUser;
    setStoredAccessToken(nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }

  function clearSession() {
    token.value = null;
    user.value = null;
    clearStoredAccessToken();
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  /** POST /auth/login 성공 시 세션(JWT + 사용자 정보)을 저장한다. */
  async function login(email: string, password: string): Promise<boolean> {
    loginLoading.value = true;
    loginError.value = null;
    try {
      const result = await authApi.login({ email, password });
      setSession(result.accessToken, result.user);
      return true;
    } catch (error) {
      loginError.value = extractErrorMessage(error, '로그인에 실패했습니다');
      return false;
    } finally {
      loginLoading.value = false;
    }
  }

  function logout() {
    clearSession();
  }

  /**
   * GET /auth/me — 저장된 토큰의 유효성을 서버에 재확인하고 최신 사용자 정보로 갱신한다.
   * 토큰이 만료/위조된 경우 401 인터셉터가 자동으로 토큰을 지우고 /login으로 보내므로,
   * 여기서는 성공 시 user만 갱신하고 실패 시 세션을 정리하는 역할만 한다.
   */
  async function fetchMe(): Promise<boolean> {
    if (!token.value) {
      meChecked.value = true;
      return false;
    }
    meLoading.value = true;
    try {
      const me = await authApi.me();
      user.value = me;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
      return true;
    } catch {
      clearSession();
      return false;
    } finally {
      meLoading.value = false;
      meChecked.value = true;
    }
  }

  return {
    token,
    user,
    loginLoading,
    loginError,
    meLoading,
    meChecked,
    isAuthenticated,
    hasRole,
    login,
    logout,
    fetchMe,
  };
});
