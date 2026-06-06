import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy initialization - only connects when first used at runtime
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const sql = neon(url, { fetchOptions: { cache: "no-store" } });
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (getDb() as Record<string | symbol, unknown>)[prop];
  },
});

export type Database = typeof db;
