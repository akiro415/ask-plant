import axios, { AxiosError } from 'axios';

export const API_BASE_URL = 'http://localhost:3000/api/v1';

const ACCESS_TOKEN_STORAGE_KEY = 'ask-plant.accessToken';

/**
 * 로그인 토큰을 localStorage에 보관하는 단일 지점.
 * stores/auth.ts가 아닌 여기서 관리하는 이유: axios interceptor(아래)가
 * Pinia 스토어를 import하면 http.ts → stores/auth.ts → api/auth.api.ts → http.ts로
 * 순환 참조가 생기기 때문에, 토큰 저장은 store와 무관한 순수 함수로 분리한다.
 */
export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setStoredAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearStoredAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/** 모든 요청에 로그인 토큰이 있으면 Authorization: Bearer 헤더를 자동으로 첨부한다. */
httpClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 401 응답을 받으면 토큰을 비우고 /login으로 이동시킨다(현재 위치를 redirect 쿼리로 보존).
 * 단, /auth/login 자체의 401(비밀번호 오류 등)은 로그인 폼에서 에러 메시지로 처리해야 하므로 리다이렉트 대상에서 제외한다.
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = axios.isAxiosError(error) && error.config?.url?.includes('/auth/login');
    if (axios.isAxiosError(error) && error.response?.status === 401 && !isLoginRequest) {
      clearStoredAccessToken();
      const { pathname, search } = window.location;
      if (!pathname.startsWith('/login')) {
        const redirect = encodeURIComponent(pathname + search);
        window.location.href = `/login?redirect=${redirect}`;
      }
    }
    return Promise.reject(error);
  },
);

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** axios 에러에서 서버가 내려준 표준 에러 메시지({ error: { message } })를 우선 추출한다. */
export function extractErrorMessage(error: unknown, fallback = '요청 처리 중 오류가 발생했습니다'): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const serverMessage = axiosError.response?.data?.error?.message;
    if (serverMessage) return serverMessage;
    if (axiosError.code === 'ERR_NETWORK') return '서버에 연결할 수 없습니다. 서버 실행 상태를 확인해주세요.';
    if (axiosError.message) return axiosError.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
