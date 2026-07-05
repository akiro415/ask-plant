import type { UserRole } from '@prisma/client';
import { ForbiddenError } from '../middleware/errorHandler';
import type { AuthenticatedUser } from '../types/express';

/** DB에 저장되지 않는 비로그인 가상 역할 (프론트 전용) */
export const VIRTUAL_PUBLIC_ROLE = 'PUBLIC' as const;

export type VirtualRole = UserRole | typeof VIRTUAL_PUBLIC_ROLE;

export function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === 'ADMIN';
}

export function isStaff(user: AuthenticatedUser): boolean {
  return user.role === 'STAFF';
}

export function isCustomer(user: AuthenticatedUser): boolean {
  return user.role === 'CUSTOMER';
}

/** ADMIN / STAFF — 전체 데이터 조회·CUD(유저 관리 제외) */
export function isOperator(user: AuthenticatedUser): boolean {
  return user.role === 'ADMIN' || user.role === 'STAFF';
}

/** 사용자 관리 API — ADMIN 전용 */
export function canManageUsers(user: AuthenticatedUser): boolean {
  return user.role === 'ADMIN';
}

/**
 * Plant / Image / History / QR 목록·집계용 owner 필터.
 * ADMIN/STAFF: 제한 없음(undefined). CUSTOMER: 본인 ownerId 강제.
 */
export function ownerScopeFilter(user: AuthenticatedUser): string | undefined {
  return user.role === 'CUSTOMER' ? user.id : undefined;
}

/** CUSTOMER가 타인 소유 리소스에 접근하려 할 때 403 */
export function assertOwnerAccess(resourceOwnerId: string | null | undefined, user: AuthenticatedUser): void {
  if (user.role === 'CUSTOMER' && resourceOwnerId !== user.id) {
    throw new ForbiddenError('본인 소유 데이터만 접근할 수 있습니다');
  }
}

/**
 * 개체 생성 시 ownerId 결정.
 * CUSTOMER: 항상 본인. ADMIN/STAFF: 요청 ownerId 또는 본인(생성자).
 */
export function resolveCreateOwnerId(requestedOwnerId: string | undefined, user: AuthenticatedUser): string {
  if (user.role === 'CUSTOMER') return user.id;
  return requestedOwnerId?.trim() ? requestedOwnerId.trim() : user.id;
}

/** CUSTOMER는 ownerId/isPublic 변경 불가 — update payload에서 제거 */
export function sanitizePlantUpdateForRole<T extends { ownerId?: string | null; isPublic?: boolean }>(
  input: T,
  user: AuthenticatedUser,
): T {
  if (isOperator(user)) return input;
  const { ownerId: _o, isPublic: _p, ...rest } = input;
  return rest as T;
}

/** PUBLIC API Plant 필터 — 공개 노출만 */
export function publicPlantWhere(): { isPublic: true; deletedAt: null } {
  return { isPublic: true, deletedAt: null };
}
