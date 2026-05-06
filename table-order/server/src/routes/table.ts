import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ValidationError, NotFoundError, ConflictError } from '../middleware/error';
import { sseManager } from '../utils/sse-manager';

const router = Router();

// POST /api/tables — 테이블 등록 (관리자)
router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const { tableNumber, password } = req.body;
    const storeId = req.user!.storeId;

    if (!tableNumber || tableNumber < 1) {
      throw new ValidationError('테이블 번호는 1 이상이어야 합니다');
    }
    if (!password || password.length < 4) {
      throw new ValidationError('비밀번호는 4자 이상이어야 합니다');
    }

    const db = getDb();

    // 중복 확인
    const existing = db.prepare(
      'SELECT id FROM tables WHERE store_id = ? AND table_number = ?'
    ).get(storeId, tableNumber);
    if (existing) {
      throw new ConflictError('이미 존재하는 테이블 번호입니다');
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.prepare(
      'INSERT INTO tables (store_id, table_number, password_hash) VALUES (?, ?, ?)'
    ).run(storeId, tableNumber, passwordHash);

    const table = db.prepare('SELECT id, store_id, table_number, current_session_id, created_at FROM tables WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
});

// GET /api/tables — 테이블 목록 조회 (관리자)
router.get('/', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const storeId = req.user!.storeId;
    const db = getDb();

    const tables = db.prepare(
      'SELECT id, store_id, table_number, current_session_id, created_at FROM tables WHERE store_id = ? ORDER BY table_number'
    ).all(storeId) as any[];

    // 각 테이블의 현재 세션 총 주문액 계산
    const tablesWithTotal = tables.map(table => {
      let totalAmount = 0;
      if (table.current_session_id) {
        const result = db.prepare(
          'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE session_id = ?'
        ).get(table.current_session_id) as any;
        totalAmount = result.total;
      }
      return { ...table, totalAmount };
    });

    res.json(tablesWithTotal);
  } catch (err) {
    next(err);
  }
});

// POST /api/tables/:id/complete — 매장 이용 완료 (관리자)
router.post('/:id/complete', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const tableId = req.params.id;
    const storeId = req.user!.storeId;

    const db = getDb();
    const table = db.prepare(
      'SELECT * FROM tables WHERE id = ? AND store_id = ?'
    ).get(tableId, storeId) as any;

    if (!table) {
      throw new NotFoundError('테이블을 찾을 수 없습니다');
    }

    if (!table.current_session_id) {
      throw new ValidationError('현재 활성 세션이 없습니다');
    }

    const sessionId = table.current_session_id;

    // 트랜잭션으로 이용완료 처리
    const completeSession = db.transaction(() => {
      // 현재 세션의 모든 주문 조회
      const orders = db.prepare(
        'SELECT * FROM orders WHERE session_id = ?'
      ).all(sessionId) as any[];

      // 각 주문을 이력으로 이동
      for (const order of orders) {
        const items = db.prepare(
          'SELECT * FROM order_items WHERE order_id = ?'
        ).all(order.id);

        const orderData = JSON.stringify({ ...order, items });

        db.prepare(
          `INSERT INTO order_history (store_id, table_id, table_number, session_id, order_data, total_amount)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(storeId, table.id, table.table_number, sessionId, orderData, order.total_amount);
      }

      // 주문 항목 삭제 (CASCADE로 자동 삭제되지만 명시적으로)
      db.prepare('DELETE FROM orders WHERE session_id = ?').run(sessionId);

      // 세션 리셋
      db.prepare('UPDATE tables SET current_session_id = NULL WHERE id = ?').run(tableId);
    });

    completeSession();

    // SSE 알림
    sseManager.broadcast(storeId, 'table-completed', { tableId: Number(tableId) });

    res.json({ message: '매장 이용 완료 처리되었습니다' });
  } catch (err) {
    next(err);
  }
});

// GET /api/tables/:id/history — 과거 주문 내역 조회 (관리자)
router.get('/:id/history', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const tableId = req.params.id;
    const storeId = req.user!.storeId;
    const { date } = req.query;

    const db = getDb();
    const table = db.prepare(
      'SELECT * FROM tables WHERE id = ? AND store_id = ?'
    ).get(tableId, storeId);

    if (!table) {
      throw new NotFoundError('테이블을 찾을 수 없습니다');
    }

    let query = 'SELECT * FROM order_history WHERE table_id = ?';
    const params: any[] = [tableId];

    if (date) {
      query += ' AND DATE(completed_at) = ?';
      params.push(date as string);
    }

    query += ' ORDER BY completed_at DESC';

    const history = db.prepare(query).all(...params) as any[];

    // order_data JSON 파싱
    const parsedHistory = history.map(h => ({
      ...h,
      orderData: JSON.parse(h.order_data)
    }));

    res.json(parsedHistory);
  } catch (err) {
    next(err);
  }
});

export default router;
