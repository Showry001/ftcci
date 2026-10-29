// Applies pending database migrations: `npm run migrate`.
import { ConfigError } from "./config.ts";
import { createDb, migrate } from "./db/index.ts";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error(new ConfigError("Configuration error: DATABASE_URL is not set. See api/.env.example.").message);
  process.exit(1);
}

const db = createDb(url);
try {
  const applied = await migrate(db);
  console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Database is up to date.");
} finally {
  await db.destroy();
}
