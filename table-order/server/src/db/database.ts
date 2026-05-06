import initSqlJs from 'sql.js';
import type { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/table-order.db');

let db: SqlJsDatabase | null = null;
let initialized = false;

// better-sqlite3 호환 래퍼
export interface Statement {
  run(...params: any[]): { lastInsertRowid: number; changes: number };
  get(...params: any[]): any;
  all(...params: any[]): any[];
}

export interface DbWrapper {
  exec(sql: string): void;
  prepare(sql: string): Statement;
  transaction<T>(fn: () => T): () => T;
}

function createWrapper(database: SqlJsDatabase): DbWrapper {
  return {
    exec(sql: string) {
      database.run(sql);
    },
    prepare(sql: string): Statement {
      return {
        run(...params: any[]) {
          database.run(sql, params);
          const lastId = database.exec("SELECT last_insert_rowid() as id");
          const changes = database.getRowsModified();
          const lastInsertRowid = lastId.length > 0 ? lastId[0].values[0][0] as number : 0;
          saveDatabase();
          return { lastInsertRowid, changes };
        },
        get(...params: any[]) {
          const stmt = database.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const columns = stmt.getColumnNames();
            const values = stmt.get();
            stmt.free();
            const row: any = {};
            columns.forEach((col: string, i: number) => { row[col] = values[i]; });
            return row;
          }
          stmt.free();
          return undefined;
        },
        all(...params: any[]) {
          const stmt = database.prepare(sql);
          if (params.length > 0) stmt.bind(params);
          const results: any[] = [];
          const columns = stmt.getColumnNames();
          while (stmt.step()) {
            const values = stmt.get();
            const row: any = {};
            columns.forEach((col: string, i: number) => { row[col] = values[i]; });
            results.push(row);
          }
          stmt.free();
          return results;
        }
      };
    },
    transaction<T>(fn: () => T): () => T {
      return () => {
        database.run("BEGIN TRANSACTION");
        try {
          const result = fn();
          database.run("COMMIT");
          saveDatabase();
          return result;
        } catch (err) {
          database.run("ROLLBACK");
          throw err;
        }
      };
    }
  };
}

export async function initDb(): Promise<void> {
  if (initialized) return;

  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  initialized = true;
}

export function getDb(): DbWrapper {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return createWrapper(db);
}

export function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    initialized = false;
  }
}
