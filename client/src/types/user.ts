export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: '관리자',
  STAFF: '직원',
  CUSTOMER: '고객',
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
