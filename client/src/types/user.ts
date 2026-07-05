export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

/** DB에 없는 비로그인 가상 역할 */
export type VirtualRole = UserRole | 'PUBLIC';

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: '운영 관리자',
  STAFF: '운영 직원',
  CUSTOMER: '컬렉터',
};

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}
