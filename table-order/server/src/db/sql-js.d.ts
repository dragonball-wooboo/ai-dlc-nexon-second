declare module 'sql.js' {
  interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): { columns: string[]; values: any[][] }[];
    prepare(sql: string): Statement;
    getRowsModified(): number;
    export(): Uint8Array;
    close(): void;
  }

  interface Statement {
    bind(params?: any[]): void;
    step(): boolean;
    get(): any[];
    getColumnNames(): string[];
    free(): void;
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database;
  }

  export default function initSqlJs(): Promise<SqlJsStatic>;
  export { Database, Statement };
}
