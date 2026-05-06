import bcrypt from 'bcryptjs';
import { initDb } from './database';
import { getDb, saveDatabase } from './database';
import { initializeSchema } from './schema';

async function seed() {
  await initDb();
  initializeSchema();

  const db = getDb();

  // 매장 생성
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    "INSERT OR IGNORE INTO stores (id, name, username, password_hash) VALUES (?, ?, ?, ?)"
  ).run('store-001', '테스트 매장', 'admin', passwordHash);

  // 카테고리 생성
  db.prepare("INSERT OR IGNORE INTO categories (store_id, name, sort_order) VALUES (?, ?, ?)").run('store-001', '음료', 1);
  db.prepare("INSERT OR IGNORE INTO categories (store_id, name, sort_order) VALUES (?, ?, ?)").run('store-001', '식사', 2);
  db.prepare("INSERT OR IGNORE INTO categories (store_id, name, sort_order) VALUES (?, ?, ?)").run('store-001', '디저트', 3);

  // 메뉴 생성
  db.prepare("INSERT OR IGNORE INTO menus (store_id, category_id, name, price, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run('store-001', 1, '아메리카노', 4500, '깊은 풍미의 에스프레소', 1);
  db.prepare("INSERT OR IGNORE INTO menus (store_id, category_id, name, price, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run('store-001', 1, '카페라떼', 5000, '부드러운 우유와 에스프레소', 2);
  db.prepare("INSERT OR IGNORE INTO menus (store_id, category_id, name, price, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run('store-001', 2, '김치찌개', 8000, '얼큰한 김치찌개', 1);
  db.prepare("INSERT OR IGNORE INTO menus (store_id, category_id, name, price, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run('store-001', 2, '된장찌개', 7500, '구수한 된장찌개', 2);
  db.prepare("INSERT OR IGNORE INTO menus (store_id, category_id, name, price, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run('store-001', 3, '케이크', 6000, '수제 딸기 케이크', 1);
  db.prepare("INSERT OR IGNORE INTO menus (store_id, category_id, name, price, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run('store-001', 1, '물', 0, '무료 제공', 3);

  // 테이블 생성
  const tableHash = bcrypt.hashSync('1234', 10);
  db.prepare("INSERT OR IGNORE INTO tables (store_id, table_number, password_hash) VALUES (?, ?, ?)").run('store-001', 1, tableHash);
  db.prepare("INSERT OR IGNORE INTO tables (store_id, table_number, password_hash) VALUES (?, ?, ?)").run('store-001', 2, tableHash);
  db.prepare("INSERT OR IGNORE INTO tables (store_id, table_number, password_hash) VALUES (?, ?, ?)").run('store-001', 3, tableHash);

  saveDatabase();
  console.log('Seed data inserted successfully!');
}

seed().catch(console.error);
