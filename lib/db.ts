import pg from "pg";

const { Pool } = pg;

const globalForDb = globalThis as unknown as { racedayPool?: pg.Pool };

export const pool =
  globalForDb.racedayPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    ssl: /supabase\.(co|com)/.test(process.env.DATABASE_URL ?? "")
      ? { rejectUnauthorized: false }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.racedayPool = pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
