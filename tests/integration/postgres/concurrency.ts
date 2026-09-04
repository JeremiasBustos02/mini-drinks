import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import postgres from "postgres";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) throw new Error("TEST_DATABASE_URL is required.");
if (testUrl === process.env.DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL must not equal DATABASE_URL.");
}

const schema = `hardening_${randomUUID().replaceAll("-", "")}`;
const admin = postgres(testUrl, { max: 1, prepare: false });
const first = postgres(testUrl, { max: 1, prepare: false });
const second = postgres(testUrl, { max: 1, prepare: false });

async function reserve(client: typeof first, attemptId: string) {
  return client.begin(async (tx) => {
    await tx.unsafe(`set local search_path to ${schema}`);
    const [product] = await tx`select id, stock from products where id = 1 for update`;
    const [reserved] = await tx`select coalesce(sum(quantity), 0)::integer as value from reservations where product_id = 1 and active and expires_at > now()`;
    if (product.stock - reserved.value < 1) return false;
    await tx`insert into reservations (attempt_id, product_id, quantity, active, expires_at) values (${attemptId}, 1, 1, true, now() + interval '15 minutes')`;
    return true;
  });
}

async function main() {
  try {
    await admin.unsafe(`create schema ${schema}`);
    await admin.unsafe(`
      create table ${schema}.products (id integer primary key, stock integer not null, version integer not null default 1);
      create table ${schema}.combos (id integer primary key, version integer not null default 1);
      create table ${schema}.categories (id integer primary key, version integer not null default 1);
      create table ${schema}.reservations (attempt_id uuid unique not null, product_id integer not null, quantity integer not null, active boolean not null, expires_at timestamptz not null);
      create table ${schema}.orders (id bigserial primary key, checkout_attempt_id uuid unique not null);
      insert into ${schema}.products (id, stock) values (1, 1);
      insert into ${schema}.combos (id) values (1);
      insert into ${schema}.categories (id) values (1);
    `);

    const reservationResults = await Promise.all([
      reserve(first, randomUUID()),
      reserve(second, randomUUID()),
    ]);
    assert.deepEqual(reservationResults.sort(), [false, true]);

    for (const table of ["products", "combos", "categories"]) {
      const updates = await Promise.all([
        first.unsafe(`update ${schema}.${table} set version = version + 1 where id = 1 and version = 1 returning version`),
        second.unsafe(`update ${schema}.${table} set version = version + 1 where id = 1 and version = 1 returning version`),
      ]);
      assert.deepEqual(updates.map((rows) => rows.length).sort(), [0, 1]);
    }

    const checkoutAttemptId = randomUUID();
    await Promise.all([
      first`insert into ${first(schema + ".orders")} (checkout_attempt_id) values (${checkoutAttemptId}) on conflict (checkout_attempt_id) do nothing`,
      second`insert into ${second(schema + ".orders")} (checkout_attempt_id) values (${checkoutAttemptId}) on conflict (checkout_attempt_id) do nothing`,
    ]);
    const [count] = await admin.unsafe(`select count(*)::integer as value from ${schema}.orders`);
    assert.equal(count.value, 1);
    console.log("PostgreSQL concurrency diagnostics passed.");
  } finally {
    await admin.unsafe(`drop schema if exists ${schema} cascade`);
    await Promise.all([admin.end(), first.end(), second.end()]);
  }
}

await main();
