import pg from "pg";

const { Client } = pg;

export function createClient(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não definida. Copie .env.example para .env.local e configure a conexão.",
    );
  }
  return new Client({
    connectionString,
    ssl: /supabase\.(co|com)/.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
  });
}
