import { httpClient } from './http';
import type { AdminUser, UserRole } from '@/types/user';

interface UserListResponse {
  data: AdminUser[];
}

interface UserItemResponse {
  data: AdminUser;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string | null;
  role?: UserRole;
  isActive?: boolean;
}

/** GET /api/v1/users — ADMIN 전용. 기본은 활성 사용자만 반환. */
export async function fetchUsers(params?: { includeInactive?: boolean; q?: string; role?: UserRole }): Promise<AdminUser[]> {
  const { data } = await httpClient.get<UserListResponse>('/users', { params });
  return data.data;
}

/** GET /api/v1/users/:id — ADMIN 전용 */
export async function fetchUserById(id: string): Promise<AdminUser> {
  const { data } = await httpClient.get<UserItemResponse>(`/users/${id}`);
  return data.data;
}

/** PUT /api/v1/users/:id — ADMIN 전용 */
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
  const { data } = await httpClient.put<UserItemResponse>(`/users/${id}`, payload);
  return data.data;
}

/** DELETE /api/v1/users/:id — ADMIN 전용. 서버에서 isActive=false로 soft delete 처리. */
export async function deleteUser(id: string): Promise<AdminUser> {
  const { data } = await httpClient.delete<UserItemResponse>(`/users/${id}`);
  return data.data;
}
