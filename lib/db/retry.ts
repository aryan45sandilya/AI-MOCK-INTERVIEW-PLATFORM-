/**
 * Retry wrapper for transient Neon DB connection errors.
 * "fetch failed" errors happen when the serverless DB is waking up.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 600): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = msg.includes("fetch failed") || msg.includes("ECONNRESET") || msg.includes("timeout");
      if (!isTransient || i === retries - 1) throw err;
      console.warn(`[DB] Transient error, retrying (${i + 1}/${retries})...`);
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw new Error("DB max retries exceeded");
}
