export interface MenuItem {
  label: string;
  icon: string;
  to: string;
}

export const ADMIN_MENU: MenuItem[] = [
  { label: 'Dashboard', icon: '📊', to: '/admin/dashboard' },
  { label: '품종관리', icon: '🌱', to: '/admin/species' },
  { label: '개체관리', icon: '🪴', to: '/admin/plants' },
  { label: '위치관리', icon: '📍', to: '/admin/locations' },
  { label: '사진관리', icon: '🖼️', to: '/admin/photos' },
  { label: 'QR관리', icon: '🔗', to: '/admin/qr' },
  { label: '공통코드', icon: '🏷️', to: '/admin/common-codes' },
  { label: '사용자관리', icon: '👤', to: '/admin/users' },
  { label: '설정', icon: '⚙️', to: '/admin/settings' },
];
