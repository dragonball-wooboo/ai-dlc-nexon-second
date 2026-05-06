import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { authenticateToken, requireAdmin, requireTable, TablePayload } from '../middleware/auth';
import { ValidationError, NotFoundError } from '../middleware/error';
import { sseManager } from '../utils/sse-manager';

const router = Router();

// POST /api/orders — 주문 생성 (테이블)
router.post('/', authenticateToken, requireTable, (req: Request, res: Response, next) => {
  try {
    const { items } = req.body;
    const user = req.user as TablePayload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError('주문 항목이 필요합니다');
    }

    // 항목 검증
    for (const item of items) {
      if (item.menuId === undefined || item.menuId === null || !item.menuName || !item.quantity || item.price === undefined || item.price === null) {
        throw new ValidationError('각 항목에 menuId, menuName, quantity, price가 필요합니다');
      }
      if (item.quantity < 1 || item.quantity > 99) {
        throw new ValidationError('수량은 1~99 범위로 입력해주세요');
      }
    }

    // 총 금액 계산
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price, 0
    );

    const db = getDb();

    // 세션 확인/생성
    let sessionId = user.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      db.prepare('UPDATE tables SET current_session_id = ? WHERE id = ?')
        .run(sessionId, user.tableId);
    }

    // 주문 생성 (트랜잭션)
    const createOrder = db.transaction(() => {
      const orderResult = db.prepare(
        `INSERT INTO orders (store_id, table_id, session_id, status, total_amount)
         VALUES (?, ?, ?, 'pending', ?)`
      ).run(user.storeId, user.tableId, sessionId, totalAmount);

      const orderId = orderResult.lastInsertRowid;

      const insertItem = db.prepare(
        'INSERT INTO order_items (order_id, menu_id, menu_name, quantity, price) VALUES (?, ?, ?, ?, ?)'
      );

      for (const item of items) {
        insertItem.run(orderId, item.menuId, item.menuName, item.quantity, item.price);
      }

      return orderId;
    });

    const orderId = createOrder();

    // 생성된 주문 조회
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    const orderWithItems = { ...order, items: orderItems };

    // SSE 알림
    sseManager.broadcast(user.storeId, 'new-order', orderWithItems);

    res.status(201).json(orderWithItems);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — 현재 테이블의 주문 조회 (테이블)
router.get('/', authenticateToken, requireTable, (req: Request, res: Response, next) => {
  try {
    const user = req.user as TablePayload;

    const db = getDb();

    // 테이블의 현재 세션ID를 DB에서 직접 조회
    const table = db.prepare('SELECT current_session_id FROM tables WHERE id = ?').get(user.tableId) as any;

    if (!table || !table.current_session_id) {
      res.json([]);
      return;
    }

    const orders = db.prepare(
      'SELECT * FROM orders WHERE session_id = ? ORDER BY created_at ASC'
    ).all(table.current_session_id) as any[];

    // 각 주문에 항목 추가
    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    res.json(ordersWithItems);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/table/:tableId — 테이블별 주문 조회 (관리자)
router.get('/table/:tableId', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const { tableId } = req.params;
    const storeId = req.user!.storeId;

    const db = getDb();
    const table = db.prepare(
      'SELECT * FROM tables WHERE id = ? AND store_id = ?'
    ).get(tableId, storeId) as any;

    if (!table) {
      throw new NotFoundError('테이블을 찾을 수 없습니다');
    }

    if (!table.current_session_id) {
      res.json({ table, orders: [] });
      return;
    }

    const orders = db.prepare(
      'SELECT * FROM orders WHERE session_id = ? ORDER BY created_at ASC'
    ).all(table.current_session_id) as any[];

    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    res.json({ table, orders: ordersWithItems });
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/status — 주문 상태 변경 (관리자)
router.put('/:id/status', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const storeId = req.user!.storeId;

    const validStatuses = ['pending', 'preparing', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError('상태는 pending, preparing, completed 중 하나여야 합니다');
    }

    const db = getDb();
    const order = db.prepare(
      'SELECT * FROM orders WHERE id = ? AND store_id = ?'
    ).get(orderId, storeId) as any;

    if (!order) {
      throw new NotFoundError('주문을 찾을 수 없습니다');
    }

    // 상태 전이 검증 (역방향 불가)
    const statusOrder = { pending: 0, preparing: 1, completed: 2 };
    const currentLevel = statusOrder[order.status as keyof typeof statusOrder];
    const newLevel = statusOrder[status as keyof typeof statusOrder];

    if (newLevel <= currentLevel) {
      throw new ValidationError(`${order.status}에서 ${status}로 변경할 수 없습니다`);
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);

    // SSE 알림
    sseManager.broadcast(storeId, 'order-updated', { orderId: Number(orderId), status });

    res.json({ orderId: Number(orderId), status });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/orders/:id — 주문 삭제 (관리자)
router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const orderId = req.params.id;
    const storeId = req.user!.storeId;

    const db = getDb();
    const order = db.prepare(
      'SELECT * FROM orders WHERE id = ? AND store_id = ?'
    ).get(orderId, storeId) as any;

    if (!order) {
      throw new NotFoundError('주문을 찾을 수 없습니다');
    }

    db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);

    // SSE 알림
    sseManager.broadcast(storeId, 'order-deleted', {
      orderId: Number(orderId),
      tableId: order.table_id
    });

    res.json({ message: '주문이 삭제되었습니다' });
  } catch (err) {
    next(err);
  }
});

export default router;
