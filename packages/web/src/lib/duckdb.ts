import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import duckdb_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?worker";

import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

let db: AsyncDuckDB | null = null;

const initDB = async () => {
  if (db) {
    return db; // Return existing database, if any
  }

  // Instantiate worker
  const logger = new duckdb.ConsoleLogger();
  const worker = new duckdb_worker();

  // and asynchronous database
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(duckdb_wasm);

  const conn = await db.connect();

  conn.send(`CREATE TABLE IF NOT EXISTS signins(
    id VARCHAR PRIMARY KEY,
    studentID INTEGER,
    date DATE,
  )`);

  await conn.send(`INSERT INTO signins VALUES ('1', 1, '2021-01-01')`);
  await conn.send(`INSERT INTO signins VALUES ('2', 2, '2023-01-02')`);

  return db;
};

export async function getSignins(
  start: Date,
  end: Date = new Date()
): Promise<{ studentID: number; id: string; date: Date }[]> {
  const db = await initDB();
  const conn = await db.connect();
  const result = await conn.query(
    `SELECT * FROM signins WHERE date >= '${start.toISOString()}' AND date <= '${end.toISOString()}'`
  );
  console.log(result)

  return result.toArray();
}

export { initDB };
