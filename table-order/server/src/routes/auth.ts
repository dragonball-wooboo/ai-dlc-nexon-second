import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database';
import { generateToken } from '../middleware/auth';
import { ValidationError, UnauthorizedError } from '../middleware/error';

const router = Router();

// POST /api/auth/admin/login
router.post('/admin/login', (req: Request, res: Response, next) => {
  try {
    const { storeId, username, password } = req.body;

    if (!storeId || !username || !password) {
      throw new ValidationError('매장ID, 사용자명, 비밀번호를 모두 입력해주세요');
    }

    const db = getDb();
    const store = db.prepare(
      'SELECT id, name, username, password_hash FROM stores WHERE id = ? AND username = ?'
    ).get(storeId, username) as any;

    if (!store) {
      throw new UnauthorizedError('매장 정보 또는 사용자명이 올바르지 않습니다');
    }

    const isValid = bcrypt.compareSync(password, store.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('비밀번호가 올바르지 않습니다');
    }

    const token = generateToken({ storeId: store.id, role: 'admin' });

    res.json({
      token,
      expiresIn: '16h',
      store: { id: store.id, name: store.name }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/table/login
router.post('/table/login', (req: Request, res: Response, next) => {
  try {
    const { storeId, tableNumber, password } = req.body;

    if (!storeId || tableNumber === undefined || !password) {
      throw new ValidationError('매장ID, 테이블번호, 비밀번호를 모두 입력해주세요');
    }

    const db = getDb();
    const table = db.prepare(
      'SELECT id, table_number, password_hash, current_session_id FROM tables WHERE store_id = ? AND table_number = ?'
    ).get(storeId, tableNumber) as any;

    if (!table) {
      throw new UnauthorizedError('테이블 정보가 올바르지 않습니다');
    }

    const isValid = bcrypt.compareSync(password, table.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('비밀번호가 올바르지 않습니다');
    }

    const token = generateToken({
      storeId,
      tableId: table.id,
      tableNumber: table.table_number,
      sessionId: table.current_session_id,
      role: 'table'
    });

    res.json({
      token,
      tableId: table.id,
      tableNumber: table.table_number,
      sessionId: table.current_session_id
    });
  } catch (err) {
    next(err);
  }
});

export default router;
