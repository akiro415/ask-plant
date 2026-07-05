import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * API 명세서(docs/api-specification.md)의 공통 에러 포맷을 따르는 애플리케이션 에러.
 * { "error": { "code", "message", "details" } }
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = '리소스를 찾을 수 없습니다') {
    super(404, 'NOT_FOUND', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '인증이 필요합니다') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '권한이 없습니다') {
    super(403, 'FORBIDDEN', message);
  }
}

export class ConflictError extends AppError {
  constructor(message = '이미 존재하는 리소스입니다', details?: ErrorDetail[]) {
    super(409, 'CONFLICT', message, details);
  }
}

export class ValidationAppError extends AppError {
  constructor(message = '요청 데이터가 올바르지 않습니다', details?: ErrorDetail[]) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

function zodErrorToDetails(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

/** Prisma의 알려진 요청 에러(P2xxx)를 API 공통 에러 포맷으로 변환한다. */
function fromPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2025':
      return new NotFoundError('리소스를 찾을 수 없습니다');
    case 'P2002': {
      const target = (error.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
      return new ConflictError(`이미 사용 중인 값입니다 (${target})`, [{ field: target, message: '중복된 값입니다' }]);
    }
    case 'P2003': {
      const field = (error.meta?.field_name as string | undefined) ?? 'foreign key';
      return new ValidationAppError('참조하는 리소스가 존재하지 않습니다', [
        { field, message: '유효하지 않은 참조 ID입니다' },
      ]);
    }
    default:
      return new AppError(500, 'INTERNAL_ERROR', '서버 오류가 발생했습니다');
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
  }

  if (err instanceof ZodError) {
    const validationError = new ValidationAppError('요청 데이터가 올바르지 않습니다', zodErrorToDetails(err));
    return res.status(validationError.statusCode).json({
      error: { code: validationError.code, message: validationError.message, details: validationError.details },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = fromPrismaError(err);
    return res.status(mapped.statusCode).json({
      error: { code: mapped.code, message: mapped.message, ...(mapped.details ? { details: mapped.details } : {}) },
    });
  }

  console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } });
}
