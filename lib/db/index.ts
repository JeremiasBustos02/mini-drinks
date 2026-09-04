import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

type PostgresClient = ReturnType<typeof postgres>;

const globalForDatabase = globalThis as typeof globalThis & {
  miniDrinksPostgres?: PostgresClient;
};

function createPostgresClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for server-side database access.");
  }

  return postgres(connectionString, {
    max: 5,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const client = globalForDatabase.miniDrinksPostgres ?? createPostgresClient();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.miniDrinksPostgres = client;
}

export const db = drizzle(client, { schema });
