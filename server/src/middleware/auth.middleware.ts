import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../lib/jwt';
import { UnauthorizedError, ForbiddenError } from './errorHandler';

/** Authorization: Bearer {token} 검증 후 req.user = { id, role } 설정. 미인증/토큰 오류 시 401. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError('인증 토큰이 없습니다');
    }

    const token = header.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('유효하지 않거나 만료된 토큰입니다'));
    }
  }
}

/** authenticate 이후 사용 — req.user.role이 roles에 포함되지 않으면 403 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('인증이 필요합니다'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('이 작업을 수행할 권한이 없습니다'));
    }
    next();
  };
}
