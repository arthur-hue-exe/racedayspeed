import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";

const PORT = Number(process.env.LOCAL_DB_PORT ?? 55432);
const DATABASE = "raceday";
const URL = `postgresql://postgres:postgres@127.0.0.1:${PORT}/${DATABASE}`;

const instance = new EmbeddedPostgres({
  databaseDir: "./.pgdata",
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

let stopped = false;

async function shutdown(code = 0) {
  if (stopped) return;
  stopped = true;
  try {
    await instance.stop();
  } catch {
    // servidor já encerrado
  }
  process.exit(code);
}

async function ensureDatabase() {
  const client = new pg.Client({
    connectionString: `postgresql://postgres:postgres@127.0.0.1:${PORT}/postgres`,
  });
  await client.connect();
  const { rows } = await client.query("select 1 from pg_database where datname = $1", [
    DATABASE,
  ]);
  if (rows.length === 0) {
    await client.query(`create database ${DATABASE}`);
    console.log(`[db] banco "${DATABASE}" criado.`);
  }
  await client.end();
}

function run(script) {
  const result = spawnSync(process.execPath, [`scripts/${script}`], {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: URL,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@racedayspeed.com",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "raceday-dev-2026",
    },
  });
  if (result.status !== 0) {
    throw new Error(`scripts/${script} terminou com código ${result.status}`);
  }
}

async function main() {
  const initialized = fs.existsSync(path.join(".pgdata", "PG_VERSION"));
  if (!initialized) {
    await instance.initialise();
  }
  await instance.start();
  console.log(`[db] PostgreSQL local em ${URL}`);
  await ensureDatabase();
  run("migrate.mjs");
  run("seed.mjs");
  console.log("[db] pronto. Pressione Ctrl+C para encerrar.");
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

main().catch(async (error) => {
  console.error("[db] falhou:", error);
  await shutdown(1);
});
