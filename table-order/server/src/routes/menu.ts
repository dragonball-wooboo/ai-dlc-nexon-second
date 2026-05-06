import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ValidationError, NotFoundError } from '../middleware/error';

const router = Router();

// GET /api/menus?storeId=xxx — 메뉴 목록 조회 (공개)
router.get('/', (req: Request, res: Response, next) => {
  try {
    const { storeId } = req.query;

    if (!storeId) {
      throw new ValidationError('storeId가 필요합니다');
    }

    const db = getDb();
    const categories = db.prepare(
      'SELECT * FROM categories WHERE store_id = ? ORDER BY sort_order'
    ).all(storeId as string);

    const menus = db.prepare(
      'SELECT * FROM menus WHERE store_id = ? ORDER BY sort_order'
    ).all(storeId as string);

    res.json({ categories, menus });
  } catch (err) {
    next(err);
  }
});

// GET /api/menus/:id — 메뉴 상세 조회 (공개)
router.get('/:id', (req: Request, res: Response, next) => {
  try {
    const db = getDb();
    const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(req.params.id);

    if (!menu) {
      throw new NotFoundError('메뉴를 찾을 수 없습니다');
    }

    res.json(menu);
  } catch (err) {
    next(err);
  }
});

// POST /api/menus — 메뉴 등록 (관리자)
router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const { name, price, description, categoryId, imageUrl, sortOrder } = req.body;
    const storeId = req.user!.storeId;

    if (!name || name.length > 50) {
      throw new ValidationError('메뉴명은 1~50자로 입력해주세요');
    }
    if (price === undefined || price < 0 || price > 1000000) {
      throw new ValidationError('가격은 0~1,000,000 범위로 입력해주세요');
    }
    if (!categoryId) {
      throw new ValidationError('카테고리를 선택해주세요');
    }
    if (description && description.length > 200) {
      throw new ValidationError('설명은 200자 이내로 입력해주세요');
    }

    const db = getDb();

    // 카테고리 존재 확인
    const category = db.prepare(
      'SELECT id FROM categories WHERE id = ? AND store_id = ?'
    ).get(categoryId, storeId);
    if (!category) {
      throw new ValidationError('존재하지 않는 카테고리입니다');
    }

    const result = db.prepare(
      `INSERT INTO menus (store_id, category_id, name, price, description, image_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(storeId, categoryId, name, price, description || '', imageUrl || '', sortOrder || 0);

    const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(menu);
  } catch (err) {
    next(err);
  }
});

// PUT /api/menus/:id — 메뉴 수정 (관리자)
router.put('/:id', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const { name, price, description, categoryId, imageUrl, sortOrder } = req.body;
    const storeId = req.user!.storeId;
    const menuId = req.params.id;

    const db = getDb();
    const existing = db.prepare(
      'SELECT * FROM menus WHERE id = ? AND store_id = ?'
    ).get(menuId, storeId);
    if (!existing) {
      throw new NotFoundError('메뉴를 찾을 수 없습니다');
    }

    if (name !== undefined && (name.length === 0 || name.length > 50)) {
      throw new ValidationError('메뉴명은 1~50자로 입력해주세요');
    }
    if (price !== undefined && (price < 0 || price > 1000000)) {
      throw new ValidationError('가격은 0~1,000,000 범위로 입력해주세요');
    }
    if (description !== undefined && description.length > 200) {
      throw new ValidationError('설명은 200자 이내로 입력해주세요');
    }

    db.prepare(
      `UPDATE menus SET
        name = COALESCE(?, name),
        price = COALESCE(?, price),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        image_url = COALESCE(?, image_url),
        sort_order = COALESCE(?, sort_order)
       WHERE id = ? AND store_id = ?`
    ).run(
      name ?? null, price ?? null, description ?? null,
      categoryId ?? null, imageUrl ?? null, sortOrder ?? null,
      menuId, storeId
    );

    const updated = db.prepare('SELECT * FROM menus WHERE id = ?').get(menuId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/menus/:id — 메뉴 삭제 (관리자)
router.delete('/:id', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const storeId = req.user!.storeId;
    const menuId = req.params.id;

    const db = getDb();
    const existing = db.prepare(
      'SELECT * FROM menus WHERE id = ? AND store_id = ?'
    ).get(menuId, storeId);
    if (!existing) {
      throw new NotFoundError('메뉴를 찾을 수 없습니다');
    }

    db.prepare('DELETE FROM menus WHERE id = ?').run(menuId);
    res.json({ message: '메뉴가 삭제되었습니다' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/menus/order — 메뉴 순서 변경 (관리자)
router.put('/order/update', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const { menuIds } = req.body;
    const storeId = req.user!.storeId;

    if (!Array.isArray(menuIds) || menuIds.length === 0) {
      throw new ValidationError('메뉴 ID 목록이 필요합니다');
    }

    const db = getDb();
    const updateStmt = db.prepare(
      'UPDATE menus SET sort_order = ? WHERE id = ? AND store_id = ?'
    );

    const transaction = db.transaction(() => {
      menuIds.forEach((menuId: number, index: number) => {
        updateStmt.run(index, menuId, storeId);
      });
    });
    transaction();

    res.json({ message: '순서가 변경되었습니다' });
  } catch (err) {
    next(err);
  }
});

// --- 카테고리 API ---

// GET /api/menus/categories?storeId=xxx — 카테고리 목록
router.get('/categories/list', (req: Request, res: Response, next) => {
  try {
    const { storeId } = req.query;
    if (!storeId) {
      throw new ValidationError('storeId가 필요합니다');
    }

    const db = getDb();
    const categories = db.prepare(
      'SELECT * FROM categories WHERE store_id = ? ORDER BY sort_order'
    ).all(storeId as string);

    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// POST /api/menus/categories — 카테고리 등록 (관리자)
router.post('/categories', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  try {
    const { name, sortOrder } = req.body;
    const storeId = req.user!.storeId;

    if (!name || name.length > 50) {
      throw new ValidationError('카테고리명은 1~50자로 입력해주세요');
    }

    const db = getDb();

    // 중복 확인
    const existing = db.prepare(
      'SELECT id FROM categories WHERE store_id = ? AND name = ?'
    ).get(storeId, name);
    if (existing) {
      throw new ValidationError('이미 존재하는 카테고리명입니다');
    }

    const result = db.prepare(
      'INSERT INTO categories (store_id, name, sort_order) VALUES (?, ?, ?)'
    ).run(storeId, name, sortOrder || 0);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

export default router;
