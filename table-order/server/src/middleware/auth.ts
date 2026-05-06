import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'table-order-secret-key';

export interface AdminPayload {
  storeId: string;
  role: 'admin';
}

export interface TablePayload {
  storeId: string;
  tableId: number;
  tableNumber: number;
  sessionId: string | null;
  role: 'table';
}

export type TokenPayload = AdminPayload | TablePayload;

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: '인증 토큰이 필요합니다' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: '관리자 권한이 필요합니다' });
    return;
  }
  next();
}

export function requireTable(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'table') {
    res.status(403).json({ error: '테이블 인증이 필요합니다' });
    return;
  }
  next();
}

export function generateToken(payload: object, expiresIn: string = '16h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
