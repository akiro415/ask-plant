import type { UserRole } from '@/types/user';

export interface MenuItem {
  label: string;
  icon: string;
  to: string;
  /** 미지정 시 모든 역할 접근 가능 */
  roles?: UserRole[];
}

export const ADMIN_MENU: MenuItem[] = [
  { label: 'Dashboard', icon: '📊', to: '/admin/dashboard', roles: ['ADMIN', 'STAFF', 'CUSTOMER'] },
  { label: '품종관리', icon: '🌱', to: '/admin/species', roles: ['ADMIN', 'STAFF'] },
  { label: '내 컬렉션', icon: '🪴', to: '/admin/plants', roles: ['CUSTOMER'] },
  { label: '개체관리', icon: '🪴', to: '/admin/plants', roles: ['ADMIN', 'STAFF'] },
  { label: '위치관리', icon: '📍', to: '/admin/locations', roles: ['ADMIN', 'STAFF', 'CUSTOMER'] },
  { label: '사진관리', icon: '🖼️', to: '/admin/photos', roles: ['ADMIN', 'STAFF', 'CUSTOMER'] },
  { label: 'QR관리', icon: '🔗', to: '/admin/qr', roles: ['ADMIN', 'STAFF', 'CUSTOMER'] },
  { label: '공통코드', icon: '🏷️', to: '/admin/common-codes', roles: ['ADMIN', 'STAFF'] },
  { label: '사용자관리', icon: '👤', to: '/admin/users', roles: ['ADMIN'] },
  { label: '설정', icon: '⚙️', to: '/admin/settings', roles: ['ADMIN', 'STAFF', 'CUSTOMER'] },
];
