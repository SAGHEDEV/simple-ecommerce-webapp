import mysql, { type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { config } from "./env";

export const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true, // return DECIMAL columns as numbers, not strings
  timezone: "Z",
});

// Keep every session in UTC so DATETIME values round-trip consistently.
pool.pool.on("connection", (conn) => conn.query("SET time_zone = '+00:00'"));

type Params = unknown[];
type Runner = Pick<PoolConnection, "query">;

/** Run a SELECT and return all rows. */
export async function query<T = RowDataPacket>(sql: string, params: Params = [], db: Runner = pool): Promise<T[]> {
  const [rows] = await db.query<RowDataPacket[]>(sql, params);
  return rows as T[];
}

/** Run a SELECT and return the first row (or undefined). */
export async function queryOne<T = RowDataPacket>(sql: string, params: Params = [], db: Runner = pool): Promise<T | undefined> {
  return (await query<T>(sql, params, db))[0];
}

/** Run an INSERT / UPDATE / DELETE. */
export async function execute(sql: string, params: Params = [], db: Runner = pool): Promise<ResultSetHeader> {
  const [result] = await db.query<ResultSetHeader>(sql, params);
  return result;
}

/** Run `fn` inside a transaction; commits on success and rolls back on error. */
export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function checkConnection() {
  await pool.query("SELECT 1");
}
