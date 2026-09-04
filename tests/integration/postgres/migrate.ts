import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { getTestDatabaseUrl } from "@/tests/integration/postgres/test-database";

async function main() {
  const client = postgres(getTestDatabaseUrl(), { max: 1, prepare: false });
  try {
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
    console.log("Test database migrations completed.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Test database migration failed.", error);
  process.exit(1);
});
