declare module 'better-sqlite3' {
  namespace Database {
    interface RunResult {
      changes: number
      lastInsertRowid: number | bigint
    }

    interface Statement {
      get(...params: any[]): unknown
      all(...params: any[]): unknown[]
      run(...params: any[]): RunResult
    }

    interface Database {
      prepare(sql: string): Statement
      pragma(source: string): unknown
      exec(sql: string): void
      close(): void
      transaction<T extends (...args: any[]) => any>(fn: T): T
    }
  }

  class Database {
    constructor(filename: string, options?: Record<string, unknown>)
    prepare(sql: string): Database.Statement
    pragma(source: string): unknown
    exec(sql: string): void
    close(): void
    transaction<T extends (...args: any[]) => any>(fn: T): T
  }

  export = Database
}
