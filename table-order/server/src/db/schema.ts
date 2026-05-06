import { getDb, saveDatabase } from './database';

export function initializeSchema(): void {
  const db = getDb();

  // 각 테이블을 개별 exec로 생성 (sql.js는 세미콜론 구분 다중 문 미지원)
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL,
      table_number INTEGER NOT NULL,
      password_hash TEXT NOT NULL,
      current_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, table_number)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      UNIQUE(store_id, name)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK(price >= 0),
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL,
      table_id INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'completed')),
      total_amount INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      menu_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      price INTEGER NOT NULL CHECK(price >= 0)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS order_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL,
      table_id INTEGER NOT NULL,
      table_number INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      order_data TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec('CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_orders_store_status ON orders(store_id, status)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_order_history_table ON order_history(table_id, completed_at)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_menus_store_category ON menus(store_id, category_id)');

  saveDatabase();
}
