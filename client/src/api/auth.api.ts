import { httpClient } from './http';
import type { UserRole } from '@/types/user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

interface LoginResponse {
  data: LoginResult;
}

interface MeResponse {
  data: AuthUser;
}

export const authApi = {
  /** POST /auth/login — 성공 시 JWT accessToken + 사용자 정보를 반환한다. */
  async login(payload: LoginPayload): Promise<LoginResult> {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', payload);
    return data.data;
  },

  /** GET /auth/me — 인증 필요, 토큰 유효성 재확인 및 최신 프로필 조회용. */
  async me(): Promise<AuthUser> {
    const { data } = await httpClient.get<MeResponse>('/auth/me');
    return data.data;
  },
};
