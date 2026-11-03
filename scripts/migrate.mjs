import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "./lib.mjs";

const dir = path.join(process.cwd(), "db", "migrations");

export async function migrate() {
  const client = createClient();
  await client.connect();
  try {
    await client.query(`
      create table if not exists schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      )
    `);
    const { rows } = await client.query("select name from schema_migrations");
    const applied = new Set(rows.map((row) => row.name));
    const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".sql")).sort();

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await fs.readFile(path.join(dir, file), "utf8");
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
        console.log(`[migrate] aplicado: ${file}`);
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
    console.log(`[migrate] ${files.length} migração(ões) verificada(s).`);
  } finally {
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  migrate().catch((error) => {
    console.error("[migrate] falhou:", error);
    process.exit(1);
  });
}
