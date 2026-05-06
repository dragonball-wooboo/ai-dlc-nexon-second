import { getDb } from './database';

export function initializeSchema(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL REFERENCES stores(id),
      table_number INTEGER NOT NULL,
      password_hash TEXT NOT NULL,
      current_session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, table_number)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL REFERENCES stores(id),
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      UNIQUE(store_id, name)
    );

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL REFERENCES stores(id),
      category_id INTEGER NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK(price >= 0),
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL REFERENCES stores(id),
      table_id INTEGER NOT NULL REFERENCES tables(id),
      session_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'completed')),
      total_amount INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_id INTEGER NOT NULL,
      menu_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      price INTEGER NOT NULL CHECK(price >= 0)
    );

    CREATE TABLE IF NOT EXISTS order_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id TEXT NOT NULL,
      table_id INTEGER NOT NULL,
      table_number INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      order_data TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id);
    CREATE INDEX IF NOT EXISTS idx_orders_store_status ON orders(store_id, status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_history_table ON order_history(table_id, completed_at);
    CREATE INDEX IF NOT EXISTS idx_menus_store_category ON menus(store_id, category_id);
  `);
}
