import type { AdminUser } from '@/types/user';

export const mockUsers: AdminUser[] = [
  { id: 'user-admin-1', email: 'admin@askplant.com', name: '관리자', phone: '010-1000-0001', role: 'ADMIN', isActive: true, createdAt: '2025-11-01T00:00:00.000Z' },
  { id: 'user-staff-1', email: 'staff1@askplant.com', name: '김직원', phone: '010-1000-0002', role: 'STAFF', isActive: true, createdAt: '2025-11-05T00:00:00.000Z' },
  { id: 'user-staff-2', email: 'staff2@askplant.com', name: '이직원', phone: '010-1000-0003', role: 'STAFF', isActive: true, createdAt: '2025-12-01T00:00:00.000Z' },
  { id: 'user-customer-1', email: 'sona.lee@example.com', name: '이소나', phone: '010-2222-3333', role: 'CUSTOMER', isActive: true, createdAt: '2026-02-14T00:00:00.000Z' },
  { id: 'user-customer-2', email: 'minsu.kim@example.com', name: '김민수', phone: '010-4444-5555', role: 'CUSTOMER', isActive: true, createdAt: '2026-03-02T00:00:00.000Z' },
  { id: 'user-customer-3', email: 'jiwon.park@example.com', name: '박지원', phone: '010-6666-7777', role: 'CUSTOMER', isActive: false, createdAt: '2026-03-20T00:00:00.000Z' },
];

export function findUser(id: string | null): AdminUser | null {
  if (!id) return null;
  return mockUsers.find((u) => u.id === id) ?? null;
}
