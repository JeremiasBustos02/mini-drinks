import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  lte,
  sql,
  type SQL,
} from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getAdminAccess } from "@/lib/admin/auth";
import { parseOrderItemConfigurationSnapshot } from "@/lib/checkout/order-snapshot";
import { db } from "@/lib/db";
import {
  categories,
  comboImages,
  comboItems,
  combos,
  orderItems,
  orders,
  payments,
  products,
  stockReservations,
} from "@/lib/db/schema";
import { availableStockSql } from "@/lib/stock/availability-sql";
import { getEffectiveReservationStatus } from "@/lib/stock/effective-status";
import type { OrderStatus, PaymentStatus, ProductType } from "@/types/domain";

const availableStock = availableStockSql();
const DASHBOARD_STATEMENT_TIMEOUT_MS = 15_000;

type AdminReadDatabase = Pick<typeof db, "execute" | "select" | "selectDistinctOn">;

async function authorizeAdminRead() {
  await connection();
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") redirect("/admin/login");
  if (access.status === "forbidden") redirect("/admin/acceso-denegado");
}

async function traceDashboardMetric<T>(name: string, query: Promise<T>) {
  const startedAt = performance.now();
  console.info(`[dashboard.metrics.${name}] start`);

  try {
    const result = await query;
    console.info(`[dashboard.metrics.${name}] end`, {
      durationMs: Math.round(performance.now() - startedAt),
      status: "success",
    });
    return result;
  } catch (error) {
    console.error(`[dashboard.metrics.${name}] end`, {
      durationMs: Math.round(performance.now() - startedAt),
      errorName: error instanceof Error ? error.name : "UnknownError",
      status: "error",
    });
    throw error;
  }
}

async function withDashboardStatementTimeout<T>(operation: (database: AdminReadDatabase) => Promise<T>) {
  return db.transaction(async (transaction) => {
    await transaction.execute(sql`select set_config(
      'statement_timeout',
      ${String(DASHBOARD_STATEMENT_TIMEOUT_MS)},
      true
    )`);
    return operation(transaction);
  });
}

export async function getAdminDashboardStats() {
  await authorizeAdminRead();
  const [stats] = await withDashboardStatementTimeout((database) => traceDashboardMetric("query", database.execute(sql<{
    products: number;
    publishedProducts: number;
    lowStockProducts: number;
    activeCombos: number;
    pendingOrders: number;
    paidOrders: number;
  }>`
    select
      (select count(*)::integer from ${products}) as "products",
      (
        select count(*)::integer
        from ${products}
        where ${products.published} = true and ${products.active} = true
      ) as "publishedProducts",
      (
        select count(*)::integer
        from ${products}
        where ${products.active} = true and ${availableStock} <= 5
      ) as "lowStockProducts",
      (
        select count(*)::integer
        from ${combos}
        where ${combos.active} = true and ${combos.published} = true
      ) as "activeCombos",
      (
        select count(${orders.id})::integer
        from ${orders}
        left join ${stockReservations} on ${stockReservations.orderId} = ${orders.id}
        where ${orders.status} in ('pending_payment', 'payment_pending')
          and not coalesce(
            ${stockReservations.status} = 'active' and ${stockReservations.expiresAt} <= now(),
            false
          )
      ) as "pendingOrders",
      (
        select count(distinct ${payments.orderId})::integer
        from ${payments}
        where ${payments.status} = 'approved'
      ) as "paidOrders"
  `)));

  return {
    products: Number(stats?.products ?? 0),
    publishedProducts: Number(stats?.publishedProducts ?? 0),
    lowStockProducts: Number(stats?.lowStockProducts ?? 0),
    activeCombos: Number(stats?.activeCombos ?? 0),
    pendingOrders: Number(stats?.pendingOrders ?? 0),
    paidOrders: Number(stats?.paidOrders ?? 0),
  };
}

export async function getAdminCategories() {
  await authorizeAdminRead();
  return db
    .select({ category: categories, productCount: count(products.id) })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export type AdminProductStatusFilter =
  | "published"
  | "hidden"
  | "active"
  | "inactive"
  | "low_stock"
  | "out_of_stock";

export type AdminProductFilters = {
  search?: string;
  categoryId?: string;
  productType?: ProductType;
  status?: AdminProductStatusFilter;
};

export async function getAdminProducts(filters: AdminProductFilters = {}) {
  await authorizeAdminRead();
  const conditions: SQL[] = [];
  if (filters.search?.trim()) conditions.push(ilike(products.name, `%${filters.search.trim()}%`));
  if (filters.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
  if (filters.productType) conditions.push(eq(products.productType, filters.productType));

  if (filters.status === "published") conditions.push(eq(products.published, true));
  if (filters.status === "hidden") conditions.push(eq(products.published, false));
  if (filters.status === "active") conditions.push(eq(products.active, true));
  if (filters.status === "inactive") conditions.push(eq(products.active, false));
  if (filters.status === "low_stock") conditions.push(and(eq(products.active, true), lte(availableStock, 5))!);
  if (filters.status === "out_of_stock") conditions.push(lte(availableStock, 0));

  return db
    .select({ product: products, category: categories, availableStock })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(products.name));
}

export async function getAdminLowStockProducts(limit = 6) {
  await authorizeAdminRead();
  return queryAdminLowStockProducts(db, limit);
}

function queryAdminLowStockProducts(database: AdminReadDatabase, limit: number) {
  return database
    .select({
      id: products.id,
      name: products.name,
      stock: products.stock,
      availableStock,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.active, true), lte(availableStock, 5)))
    .orderBy(asc(availableStock), asc(products.name))
    .limit(limit);
}

export async function getAdminDashboardLowStockProducts(limit = 6) {
  await authorizeAdminRead();
  return withDashboardStatementTimeout((database) => queryAdminLowStockProducts(database, limit));
}

export async function getAdminProductOptions() {
  await authorizeAdminRead();
  return db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      stock: availableStock,
      productType: products.productType,
      imageUrl: products.imageUrl,
      active: products.active,
      published: products.published,
      categoryActive: categories.active,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.name));
}

export async function getAdminCombos(filters: { search?: string } = {}) {
  await authorizeAdminRead();
  const rows = await db
    .select({
      combo: combos,
      item: comboItems,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
        productType: products.productType,
        imageUrl: products.imageUrl,
        stock: availableStock,
      },
    })
    .from(combos)
    .leftJoin(comboItems, eq(comboItems.comboId, combos.id))
    .leftJoin(products, eq(products.id, comboItems.productId))
    .where(filters.search?.trim() ? ilike(combos.name, `%${filters.search.trim()}%`) : undefined)
    .orderBy(asc(combos.name), asc(products.name));

  const grouped = new Map<
    string,
    {
      combo: typeof combos.$inferSelect;
      components: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
        productType: ProductType;
        imageUrl: string | null;
        stock: number;
      }>;
      referencePrice: number;
      availability: number;
      images: (typeof comboImages.$inferSelect)[];
    }
  >();

  for (const row of rows) {
    const entry = grouped.get(row.combo.id) ?? {
      combo: row.combo,
      components: [],
      referencePrice: 0,
      availability: Number.POSITIVE_INFINITY,
      images: [],
    };

    if (row.item && row.product?.id && row.product.name && row.product.price !== null && row.product.productType && row.product.stock !== null) {
      entry.components.push({
        productId: row.product.id,
        name: row.product.name,
        quantity: row.item.quantity,
        price: row.product.price,
        productType: row.product.productType,
        imageUrl: row.product.imageUrl,
        stock: row.product.stock,
      });
      entry.referencePrice += row.product.price * row.item.quantity;
      entry.availability = Math.min(entry.availability, Math.floor(row.product.stock / row.item.quantity));
    }
    grouped.set(row.combo.id, entry);
  }

  const imageRows = grouped.size > 0
    ? await db
        .select()
        .from(comboImages)
        .where(inArray(comboImages.comboId, [...grouped.keys()]))
        .orderBy(asc(comboImages.comboId), desc(comboImages.isPrimary), asc(comboImages.sortOrder), asc(comboImages.createdAt), asc(comboImages.id))
    : [];
  for (const image of imageRows) grouped.get(image.comboId)?.images.push(image);

  return [...grouped.values()].map((entry) => ({
    ...entry,
    combo: {
      ...entry.combo,
      imageUrl: entry.images[0]?.imageUrl ?? entry.combo.imageUrl,
    },
    availability: Number.isFinite(entry.availability) ? entry.availability : 0,
  }));
}

export type AdminOrderFilters = {
  search?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
};

export async function getAdminOrders(filters: AdminOrderFilters = {}, limit = 100) {
  await authorizeAdminRead();
  return queryAdminOrders(db, filters, limit);
}

async function queryAdminOrders(database: AdminReadDatabase, filters: AdminOrderFilters, limit: number) {
  const latestPayment = database
    .selectDistinctOn([payments.orderId], {
      orderId: payments.orderId,
      status: payments.status,
      updatedAt: payments.updatedAt,
    })
    .from(payments)
    .orderBy(payments.orderId, desc(payments.updatedAt), desc(payments.createdAt), desc(payments.id))
    .as("latest_payment");

  const conditions: SQL[] = [];
  if (filters.search?.trim()) conditions.push(ilike(orders.publicNumber, `%${filters.search.trim()}%`));
  if (filters.orderStatus === "expired") {
    conditions.push(sql`(${orders.status} = 'expired' or (${orders.status} in ('pending_payment', 'payment_pending') and ${stockReservations.status} = 'active' and ${stockReservations.expiresAt} <= now()))`);
  } else if (filters.orderStatus) conditions.push(eq(orders.status, filters.orderStatus));
  if (filters.orderStatus === "pending_payment" || filters.orderStatus === "payment_pending") {
    conditions.push(sql`not coalesce(${stockReservations.status} = 'active' and ${stockReservations.expiresAt} <= now(), false)`);
  }
  if (filters.paymentStatus) conditions.push(eq(latestPayment.status, filters.paymentStatus));

  const rows = await database
    .select({
      id: orders.id,
      publicNumber: orders.publicNumber,
      status: orders.status,
      total: orders.total,
      deliveryType: orders.deliveryType,
      createdAt: orders.createdAt,
      paymentStatus: latestPayment.status,
      reservationStatus: stockReservations.status,
      reservationExpiresAt: stockReservations.expiresAt,
    })
    .from(orders)
    .leftJoin(latestPayment, eq(latestPayment.orderId, orders.id))
    .leftJoin(stockReservations, eq(stockReservations.orderId, orders.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(limit);

  const now = new Date();
  return rows.map((order) => ({
    ...order,
    status:
      (order.status === "pending_payment" || order.status === "payment_pending") &&
      getEffectiveReservationStatus(order.reservationStatus, order.reservationExpiresAt, now) === "expired"
        ? ("expired" as const)
        : order.status,
    effectiveReservationStatus: getEffectiveReservationStatus(
      order.reservationStatus,
      order.reservationExpiresAt,
      now,
    ),
  }));
}

export async function getAdminDashboardOrders(limit = 5) {
  await authorizeAdminRead();
  return withDashboardStatementTimeout((database) => queryAdminOrders(database, {}, limit));
}

export async function getAdminOrderDetail(id: string) {
  await authorizeAdminRead();
  const [order] = await db
    .select({
      id: orders.id,
      publicNumber: orders.publicNumber,
      status: orders.status,
      customerName: orders.customerName,
      customerLastName: orders.customerLastName,
      customerPhone: orders.customerPhone,
      customerEmail: orders.customerEmail,
      deliveryType: orders.deliveryType,
      deliveryAddress: orders.deliveryAddress,
      city: orders.city,
      notes: orders.notes,
      subtotal: orders.subtotal,
      discountTotal: orders.discountTotal,
      deliveryTotal: orders.deliveryTotal,
      total: orders.total,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) return null;

  const [itemRows, paymentRows, reservationRows] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        itemType: orderItems.itemType,
        displayName: orderItems.displayName,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        subtotal: orderItems.subtotal,
        configurationJson: orderItems.configurationJson,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(asc(orderItems.createdAt), asc(orderItems.id)),
    db
      .select({
        id: payments.id,
        provider: payments.provider,
        providerPaymentId: payments.providerPaymentId,
        status: payments.status,
        statusDetail: payments.statusDetail,
        amount: payments.amount,
        currency: payments.currency,
        dateApproved: payments.dateApproved,
        providerMetadata: payments.providerMetadata,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
      })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(desc(payments.updatedAt), desc(payments.createdAt), desc(payments.id)),
    db
      .select({
        status: stockReservations.status,
        expiresAt: stockReservations.expiresAt,
        createdAt: stockReservations.createdAt,
        consumedAt: stockReservations.consumedAt,
        releasedAt: stockReservations.releasedAt,
      })
      .from(stockReservations)
      .where(eq(stockReservations.orderId, order.id))
      .limit(1),
  ]);

  const reservation = reservationRows[0] ?? null;
  const effectiveReservationStatus = getEffectiveReservationStatus(
    reservation?.status,
    reservation?.expiresAt,
  );
  const effectiveOrder = {
    ...order,
    status:
      (order.status === "pending_payment" || order.status === "payment_pending") &&
      effectiveReservationStatus === "expired"
        ? ("expired" as const)
        : order.status,
  };

  return {
    order: effectiveOrder,
    items: itemRows.map((item) => {
      const configuration = parseOrderItemConfigurationSnapshot(item.configurationJson);
      return {
        ...item,
        configuration,
        hasInvalidConfiguration: item.configurationJson !== null && configuration === null,
      };
    }),
    payments: paymentRows,
    reservation,
    effectiveReservationStatus,
  };
}

export type AdminOrderDetailData = NonNullable<Awaited<ReturnType<typeof getAdminOrderDetail>>>;
