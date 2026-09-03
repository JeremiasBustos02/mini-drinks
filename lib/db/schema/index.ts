import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  deliveryTypeValues,
  orderItemTypeValues,
  orderStatusValues,
  paymentStatusValues,
  productTypeValues,
} from "@/types/domain";
import type { OrderItemConfigurationSnapshot } from "@/types/checkout";

export const productTypeEnum = pgEnum("product_type", productTypeValues);
export const orderStatusEnum = pgEnum("order_status", orderStatusValues);
export const orderItemTypeEnum = pgEnum("order_item_type", orderItemTypeValues);
export const deliveryTypeEnum = pgEnum("delivery_type", deliveryTypeValues);
export const paymentStatusEnum = pgEnum("payment_status", paymentStatusValues);

const createdAtColumn = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAtColumn = () =>
  timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    active: boolean("active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),
    check("categories_sort_order_non_negative", sql`${table.sortOrder} >= 0`),
  ],
).enableRLS();

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: uuid("auth_user_id").notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [uniqueIndex("admin_users_auth_user_id_unique").on(table.authUserId)],
).enableRLS();

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    productType: productTypeEnum("product_type").notNull(),
    price: bigint("price", { mode: "number" }).notNull(),
    stock: integer("stock").default(0).notNull(),
    active: boolean("active").default(true).notNull(),
    published: boolean("published").default(false).notNull(),
    imageUrl: text("image_url"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_category_id_idx").on(table.categoryId),
    index("products_published_active_idx").on(table.published, table.active),
    check(
      "products_price_safe_range",
      sql`${table.price} >= 0 and ${table.price} <= 9007199254740991`,
    ),
    check("products_stock_non_negative", sql`${table.stock} >= 0`),
  ],
).enableRLS();

export const combos = pgTable(
  "combos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    promotionalPrice: bigint("promotional_price", { mode: "number" }),
    active: boolean("active").default(true).notNull(),
    published: boolean("published").default(false).notNull(),
    imageUrl: text("image_url"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    version: integer("version").default(1).notNull(),
  },
  (table) => [
    uniqueIndex("combos_slug_unique").on(table.slug),
    index("combos_published_active_idx").on(table.published, table.active),
    check(
      "combos_promotional_price_safe_range",
      sql`${table.promotionalPrice} is null or (${table.promotionalPrice} >= 0 and ${table.promotionalPrice} <= 9007199254740991)`,
    ),
  ],
).enableRLS();

export const comboItems = pgTable(
  "combo_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    comboId: uuid("combo_id")
      .notNull()
      .references(() => combos.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    uniqueIndex("combo_items_combo_product_unique").on(table.comboId, table.productId),
    index("combo_items_product_id_idx").on(table.productId),
    check("combo_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
).enableRLS();

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicNumber: text("public_number").notNull(),
    checkoutAttemptId: uuid("checkout_attempt_id").notNull(),
    accessTokenHash: text("access_token_hash").notNull(),
    checkoutRequestHash: text("checkout_request_hash").notNull(),
    status: orderStatusEnum("status").default("pending_payment").notNull(),
    customerName: text("customer_name").notNull(),
    customerLastName: text("customer_last_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerEmail: text("customer_email"),
    customerDocument: text("customer_document"),
    deliveryType: deliveryTypeEnum("delivery_type").notNull(),
    deliveryAddress: text("delivery_address"),
    city: text("city"),
    notes: text("notes"),
    subtotal: bigint("subtotal", { mode: "number" }).notNull(),
    discountTotal: bigint("discount_total", { mode: "number" }).default(0).notNull(),
    deliveryTotal: bigint("delivery_total", { mode: "number" }).default(0).notNull(),
    total: bigint("total", { mode: "number" }).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("orders_public_number_unique").on(table.publicNumber),
    uniqueIndex("orders_checkout_attempt_id_unique").on(table.checkoutAttemptId),
    uniqueIndex("orders_access_token_hash_unique").on(table.accessTokenHash),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
    check(
      "orders_subtotal_safe_range",
      sql`${table.subtotal} >= 0 and ${table.subtotal} <= 9007199254740991`,
    ),
    check(
      "orders_discount_total_safe_range",
      sql`${table.discountTotal} >= 0 and ${table.discountTotal} <= 9007199254740991`,
    ),
    check(
      "orders_delivery_total_safe_range",
      sql`${table.deliveryTotal} >= 0 and ${table.deliveryTotal} <= 9007199254740991`,
    ),
    check(
      "orders_total_safe_range",
      sql`${table.total} >= 0 and ${table.total} <= 9007199254740991`,
    ),
    check("orders_discount_not_greater_than_subtotal", sql`${table.discountTotal} <= ${table.subtotal}`),
    check(
      "orders_total_matches_components",
      sql`${table.total} = ${table.subtotal} - ${table.discountTotal} + ${table.deliveryTotal}`,
    ),
    check(
      "orders_delivery_details_required",
      sql`${table.deliveryType} = 'pickup' or (nullif(btrim(${table.deliveryAddress}), '') is not null and nullif(btrim(${table.city}), '') is not null)`,
    ),
  ],
).enableRLS();

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    itemType: orderItemTypeEnum("item_type").notNull(),
    referenceId: uuid("reference_id"),
    displayName: text("display_name").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: bigint("unit_price", { mode: "number" }).notNull(),
    subtotal: bigint("subtotal", { mode: "number" }).notNull(),
    configurationJson: jsonb("configuration_json").$type<OrderItemConfigurationSnapshot>(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "order_items_unit_price_safe_range",
      sql`${table.unitPrice} >= 0 and ${table.unitPrice} <= 9007199254740991`,
    ),
    check(
      "order_items_subtotal_safe_range",
      sql`${table.subtotal} >= 0 and ${table.subtotal} <= 9007199254740991`,
    ),
    check("order_items_subtotal_matches_quantity", sql`${table.subtotal} = ${table.unitPrice} * ${table.quantity}`),
  ],
).enableRLS();

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerPaymentId: text("provider_payment_id"),
    status: paymentStatusEnum("status").default("pending").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    rawReference: text("raw_reference"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("payments_order_id_idx").on(table.orderId),
    uniqueIndex("payments_provider_payment_id_unique").on(table.providerPaymentId),
    check(
      "payments_amount_safe_range",
      sql`${table.amount} >= 0 and ${table.amount} <= 9007199254740991`,
    ),
  ],
).enableRLS();

export type CategoryRecord = typeof categories.$inferSelect;
export type AdminUserRecord = typeof adminUsers.$inferSelect;
export type ProductRecord = typeof products.$inferSelect;
export type ComboRecord = typeof combos.$inferSelect;
export type ComboItemRecord = typeof comboItems.$inferSelect;
export type OrderRecord = typeof orders.$inferSelect;
export type OrderItemRecord = typeof orderItems.$inferSelect;
export type PaymentRecord = typeof payments.$inferSelect;
