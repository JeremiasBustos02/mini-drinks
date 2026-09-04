import { config } from "dotenv";

function parsePostgresUrl(value: string, variableName: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid PostgreSQL URL.`);
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error(`${variableName} must use postgres:// or postgresql://.`);
  }
  return url;
}

function supabaseProjectRef(url: URL) {
  const directMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
  if (directMatch) return directMatch[1].toLowerCase();
  const poolerMatch = decodeURIComponent(url.username).match(/^postgres\.([a-z0-9]+)$/i);
  return poolerMatch?.[1].toLowerCase() ?? null;
}

export function isSameDatabaseTarget(leftValue: string, rightValue: string) {
  const left = parsePostgresUrl(leftValue, "Database URL");
  const right = parsePostgresUrl(rightValue, "Database URL");
  const leftProjectRef = supabaseProjectRef(left);
  const rightProjectRef = supabaseProjectRef(right);

  if (leftProjectRef && rightProjectRef) return leftProjectRef === rightProjectRef;
  const leftPort = left.port || "5432";
  const rightPort = right.port || "5432";
  return left.hostname.toLowerCase() === right.hostname.toLowerCase() &&
    leftPort === rightPort &&
    left.pathname === right.pathname;
}

export function getTestDatabaseUrl() {
  config({ path: ".env.local", quiet: true });
  config({ quiet: true });

  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) throw new Error("TEST_DATABASE_URL is required.");
  parsePostgresUrl(testUrl, "TEST_DATABASE_URL");

  for (const variableName of ["DATABASE_URL", "DATABASE_MIGRATION_URL"] as const) {
    const protectedUrl = process.env[variableName];
    if (protectedUrl && isSameDatabaseTarget(testUrl, protectedUrl)) {
      throw new Error(`TEST_DATABASE_URL must not target the same database as ${variableName}.`);
    }
  }

  return testUrl;
}
