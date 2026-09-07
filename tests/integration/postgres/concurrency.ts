import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import postgres from "postgres";

import { getTestDatabaseUrl } from "@/tests/integration/postgres/test-database";

async function main() {
  const testUrl = getTestDatabaseUrl();

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

  async function creditLoyalty(client: typeof first, orderId: string, idempotencyKey: string) {
    return client.begin(async (tx) => {
      await tx.unsafe(`set local search_path to ${schema}`);
      const [credit] = await tx`
        insert into loyalty_transactions (loyalty_account_id, order_id, idempotency_key, points)
        values (1, ${orderId}, ${idempotencyKey}, 5)
        on conflict (idempotency_key) do nothing
        returning id
      `;
      if (!credit) return false;
      await tx`update loyalty_accounts set balance = balance + 5, lifetime_earned_points = lifetime_earned_points + 5 where id = 1`;
      return true;
    });
  }

  async function reserveRedemption(client: typeof first, orderId: string, points: number) {
    return client.begin(async (tx) => {
      await tx.unsafe(`set local search_path to ${schema}`);
      await tx`select id from loyalty_accounts where id = 1 for update`;
      const [account] = await tx`select balance from loyalty_accounts where id = 1`;
      const [reserved] = await tx`select coalesce(sum(points), 0)::integer as value from loyalty_redemptions where loyalty_account_id = 1 and status = 'reserved'`;
      if (account.balance - reserved.value < points) return false;
      await tx`insert into loyalty_redemptions (order_id, loyalty_account_id, points, status) values (${orderId}, 1, ${points}, 'reserved')`;
      return true;
    });
  }

  async function redeemReservation(client: typeof first, orderId: string) {
    return client.begin(async (tx) => {
      await tx.unsafe(`set local search_path to ${schema}`);
      const [reservation] = await tx`select * from loyalty_redemptions where order_id = ${orderId} for update`;
      if (!reservation || reservation.status !== "reserved") return false;
      await tx`update loyalty_accounts set balance = balance - ${reservation.points} where id = ${reservation.loyalty_account_id}`;
      await tx`update loyalty_redemptions set status = 'redeemed' where id = ${reservation.id}`;
      return true;
    });
  }

  try {
    await admin.unsafe(`create schema ${schema}`);
    await admin.unsafe(`
      create table ${schema}.products (id integer primary key, stock integer not null, version integer not null default 1);
      create table ${schema}.combos (id integer primary key, version integer not null default 1);
       create table ${schema}.categories (id integer primary key, version integer not null default 1);
       create table ${schema}.reservations (attempt_id uuid unique not null, product_id integer not null, quantity integer not null, active boolean not null, expires_at timestamptz not null);
       create table ${schema}.orders (id bigserial primary key, checkout_attempt_id uuid unique not null);
         create table ${schema}.loyalty_accounts (id integer primary key, balance integer not null default 0, lifetime_earned_points integer not null default 0);
         create table ${schema}.loyalty_redemptions (id bigserial primary key, order_id uuid unique not null, loyalty_account_id integer not null references ${schema}.loyalty_accounts(id), points integer not null check (points > 0), status text not null check (status in ('reserved', 'redeemed', 'released')));
        create table ${schema}.loyalty_transactions (id bigserial primary key, loyalty_account_id integer not null references ${schema}.loyalty_accounts(id), order_id uuid not null, idempotency_key text unique not null, points integer not null check (points > 0));
       insert into ${schema}.products (id, stock) values (1, 1);
       insert into ${schema}.combos (id) values (1);
       insert into ${schema}.categories (id) values (1);
        insert into ${schema}.loyalty_accounts (id, balance) values (1, 5000);
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

    const loyaltyResults = await Promise.all([
      creditLoyalty(first, randomUUID(), `order:${randomUUID()}:purchase-earned`),
      creditLoyalty(second, randomUUID(), `order:${randomUUID()}:purchase-earned`),
    ]);
    assert.deepEqual(loyaltyResults.sort(), [true, true]);

    const creditedOrderId = randomUUID();
    const earnedKey = `order:${creditedOrderId}:purchase-earned`;
    const duplicateCreditResults = await Promise.all([
      creditLoyalty(first, creditedOrderId, earnedKey),
      creditLoyalty(second, creditedOrderId, earnedKey),
    ]);
    assert.deepEqual(duplicateCreditResults.sort(), [false, true]);
    assert.equal(await creditLoyalty(first, creditedOrderId, `order:${creditedOrderId}:purchase-reversal`), true);
    const [loyaltyBalance] = await admin.unsafe(`select balance, lifetime_earned_points from ${schema}.loyalty_accounts where id = 1`);
    assert.equal(loyaltyBalance.balance, 5020);
    assert.equal(loyaltyBalance.lifetime_earned_points, 20);
    const [sameOrderTransactions] = await admin.unsafe(`select count(*)::integer as value from ${schema}.loyalty_transactions where order_id = '${creditedOrderId}'`);
    assert.equal(sameOrderTransactions.value, 2);

    const firstRedemptionOrder = randomUUID();
    const secondRedemptionOrder = randomUUID();
    const redemptionResults = await Promise.all([
      reserveRedemption(first, firstRedemptionOrder, 5000),
      reserveRedemption(second, secondRedemptionOrder, 5000),
    ]);
    assert.deepEqual(redemptionResults.sort(), [false, true]);
    const reservedOrder = redemptionResults[0] ? firstRedemptionOrder : secondRedemptionOrder;
    const redeemed = await Promise.all([
      redeemReservation(first, reservedOrder),
      redeemReservation(second, reservedOrder),
    ]);
    assert.deepEqual(redeemed.sort(), [false, true]);
    const [redeemedBalance] = await admin.unsafe(`select balance from ${schema}.loyalty_accounts where id = 1`);
    assert.equal(redeemedBalance.balance, 20);
    console.log("PostgreSQL concurrency diagnostics passed.");
  } finally {
    try {
      await admin.unsafe(`drop schema if exists ${schema} cascade`);
    } finally {
      await Promise.allSettled([admin.end(), first.end(), second.end()]);
    }
  }
}

main().catch((error) => {
  console.error("PostgreSQL concurrency diagnostics failed.", error);
  process.exit(1);
});
