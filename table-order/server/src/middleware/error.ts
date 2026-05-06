import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '리소스를 찾을 수 없습니다') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '입력값이 올바르지 않습니다') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '인증이 필요합니다') {
    super(message, 401);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '이미 존재하는 리소스입니다') {
    super(message, 409);
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ error: '서버 오류가 발생했습니다' });
}
