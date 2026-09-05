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
  stockReservationStatusValues,
} from "@/types/domain";
import type { OrderItemConfigurationSnapshot } from "@/types/checkout";

export const productTypeEnum = pgEnum("product_type", productTypeValues);
export const orderStatusEnum = pgEnum("order_status", orderStatusValues);
export const orderItemTypeEnum = pgEnum("order_item_type", orderItemTypeValues);
export const deliveryTypeEnum = pgEnum("delivery_type", deliveryTypeValues);
export const paymentStatusEnum = pgEnum("payment_status", paymentStatusValues);
export const stockReservationStatusEnum = pgEnum(
  "stock_reservation_status",
  stockReservationStatusValues,
);
export const rewardCampaignStatusEnum = pgEnum("reward_campaign_status", ["draft", "active", "paused", "ended"]);
export const rewardTypeEnum = pgEnum("reward_type", ["points", "discount_percent", "discount_fixed", "free_shipping", "multiplier", "special"]);

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
    version: integer("version").default(1).notNull(),
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

export const customerProfiles = pgTable(
  "customer_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: uuid("auth_user_id").notNull(),
    displayName: text("display_name").notNull(),
    phone: text("phone"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [uniqueIndex("customer_profiles_auth_user_id_unique").on(table.authUserId)],
).enableRLS();

export const loyaltySettings = pgTable(
  "loyalty_settings",
  {
    key: text("key").primaryKey().default("default"),
    earnUnitCents: bigint("earn_unit_cents", { mode: "number" }).notNull(),
    pointsPerUnit: integer("points_per_unit").notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    check("loyalty_settings_singleton", sql`${table.key} = 'default'`),
    check("loyalty_settings_earn_unit_cents_positive", sql`${table.earnUnitCents} > 0`),
    check("loyalty_settings_points_per_unit_positive", sql`${table.pointsPerUnit} > 0`),
  ],
).enableRLS();

export const loyaltyAccounts = pgTable(
  "loyalty_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerProfileId: uuid("customer_profile_id")
      .notNull()
      .references(() => customerProfiles.id, { onDelete: "cascade" }),
    balance: integer("balance").default(0).notNull(),
    lifetimeEarnedPoints: integer("lifetime_earned_points").default(0).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("loyalty_accounts_customer_profile_id_unique").on(table.customerProfileId),
    check("loyalty_accounts_balance_non_negative", sql`${table.balance} >= 0`),
    check("loyalty_accounts_lifetime_earned_points_non_negative", sql`${table.lifetimeEarnedPoints} >= 0`),
  ],
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
    version: integer("version").default(1).notNull(),
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

export const comboImages = pgTable(
  "combo_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    comboId: uuid("combo_id")
      .notNull()
      .references(() => combos.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    storagePath: text("storage_path"),
    alt: text("alt").default("").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index("combo_images_combo_sort_idx").on(table.comboId, table.sortOrder),
    uniqueIndex("combo_images_one_primary_per_combo")
      .on(table.comboId)
      .where(sql`${table.isPrimary} = true`),
    check("combo_images_sort_order_non_negative", sql`${table.sortOrder} >= 0`),
  ],
).enableRLS();

export const storefrontAssets = pgTable(
  "storefront_assets",
  {
    key: text("key").primaryKey(),
    imageUrl: text("image_url").notNull(),
    storagePath: text("storage_path"),
    alt: text("alt").default("").notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
).enableRLS();

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicNumber: text("public_number").notNull(),
    checkoutAttemptId: uuid("checkout_attempt_id").notNull(),
    accessTokenHash: text("access_token_hash").notNull(),
    checkoutRequestHash: text("checkout_request_hash").notNull(),
    customerProfileId: uuid("customer_profile_id").references(() => customerProfiles.id, {
      onDelete: "set null",
    }),
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
    mercadoPagoPreferenceId: text("mercado_pago_preference_id"),
    mercadoPagoInitPoint: text("mercado_pago_init_point"),
    mercadoPagoPreferenceCreatedAt: timestamp("mercado_pago_preference_created_at", {
      withTimezone: true,
    }),
    mercadoPagoPreferenceExpiresAt: timestamp("mercado_pago_preference_expires_at", {
      withTimezone: true,
    }),
    mercadoPagoPreferenceGeneration: integer("mercado_pago_preference_generation")
      .default(1)
      .notNull(),
    mercadoPagoPreferenceCreationKey: uuid("mercado_pago_preference_creation_key"),
    mercadoPagoPreferenceCreationStartedAt: timestamp(
      "mercado_pago_preference_creation_started_at",
      { withTimezone: true },
    ),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("orders_public_number_unique").on(table.publicNumber),
    uniqueIndex("orders_checkout_attempt_id_unique").on(table.checkoutAttemptId),
    uniqueIndex("orders_access_token_hash_unique").on(table.accessTokenHash),
    index("orders_status_idx").on(table.status),
    index("orders_customer_profile_id_created_at_idx").on(table.customerProfileId, table.createdAt),
    index("orders_created_at_idx").on(table.createdAt),
    uniqueIndex("orders_mercado_pago_preference_id_unique").on(
      table.mercadoPagoPreferenceId,
    ),
    index("orders_mercado_pago_preference_expires_at_idx").on(
      table.mercadoPagoPreferenceExpiresAt,
    ),
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

export const rewardCampaigns = pgTable(
  "reward_campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    status: rewardCampaignStatusEnum("status").default("draft").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [check("reward_campaigns_dates_valid", sql`${table.endsAt} is null or ${table.startsAt} is null or ${table.endsAt} > ${table.startsAt}`)],
).enableRLS();

export const rewardCodes = pgTable(
  "reward_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id").notNull().references(() => rewardCampaigns.id, { onDelete: "restrict" }),
    tokenHash: text("token_hash").notNull(),
    displayCode: text("display_code"),
    rewardType: rewardTypeEnum("reward_type").default("points").notNull(),
    rewardPoints: integer("reward_points").notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    redeemedByCustomerProfileId: uuid("redeemed_by_customer_profile_id").references(() => customerProfiles.id, { onDelete: "set null" }),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("reward_codes_token_hash_unique").on(table.tokenHash),
    index("reward_codes_campaign_id_idx").on(table.campaignId),
    index("reward_codes_redeemed_by_customer_profile_id_idx").on(table.redeemedByCustomerProfileId),
    check("reward_codes_points_positive", sql`${table.rewardPoints} > 0`),
    check("reward_codes_redemption_pair", sql`(${table.redeemedAt} is null) = (${table.redeemedByCustomerProfileId} is null)`),
  ],
).enableRLS();

export const loyaltyTransactions = pgTable(
  "loyalty_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    loyaltyAccountId: uuid("loyalty_account_id")
      .notNull()
      .references(() => loyaltyAccounts.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "restrict" }),
    rewardCodeId: uuid("reward_code_id").references(() => rewardCodes.id, { onDelete: "restrict" }),
    idempotencyKey: text("idempotency_key").notNull(),
    type: text("type").default("earn").notNull(),
    points: integer("points").notNull(),
    earnUnitCents: bigint("earn_unit_cents", { mode: "number" }).notNull(),
    pointsPerUnit: integer("points_per_unit").notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("loyalty_transactions_idempotency_key_unique").on(table.idempotencyKey),
    index("loyalty_transactions_order_id_idx").on(table.orderId),
    uniqueIndex("loyalty_transactions_reward_code_id_unique").on(table.rewardCodeId),
    index("loyalty_transactions_account_created_at_idx").on(table.loyaltyAccountId, table.createdAt),
    check("loyalty_transactions_type_supported", sql`${table.type} in ('earn', 'code_reward')`),
    check("loyalty_transactions_points_positive", sql`${table.points} > 0`),
    check("loyalty_transactions_earn_unit_cents_positive", sql`${table.earnUnitCents} > 0`),
    check("loyalty_transactions_points_per_unit_positive", sql`${table.pointsPerUnit} > 0`),
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
    preferenceId: text("preference_id"),
    status: paymentStatusEnum("status").default("pending").notNull(),
    statusDetail: text("status_detail"),
    amount: bigint("amount", { mode: "number" }).notNull(),
    currency: text("currency").default("ARS").notNull(),
    dateApproved: timestamp("date_approved", { withTimezone: true }),
    providerMetadata: jsonb("provider_metadata").$type<{
      paymentMethodId?: string;
      paymentTypeId?: string;
      validationError?: string;
    }>(),
    rawReference: text("raw_reference"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("payments_order_id_idx").on(table.orderId),
    index("payments_preference_id_idx").on(table.preferenceId),
    uniqueIndex("payments_provider_payment_id_unique").on(table.providerPaymentId),
    check(
      "payments_amount_safe_range",
      sql`${table.amount} >= 0 and ${table.amount} <= 9007199254740991`,
    ),
  ],
).enableRLS();

export const stockReservations = pgTable(
  "stock_reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: stockReservationStatusEnum("status").default("active").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAtColumn(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    releasedAt: timestamp("released_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("stock_reservations_order_id_unique").on(table.orderId),
    index("stock_reservations_status_expires_at_idx").on(table.status, table.expiresAt),
  ],
).enableRLS();

export const stockReservationItems = pgTable(
  "stock_reservation_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => stockReservations.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    uniqueIndex("stock_reservation_items_reservation_product_unique").on(
      table.reservationId,
      table.productId,
    ),
    index("stock_reservation_items_product_id_idx").on(table.productId),
    check("stock_reservation_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
).enableRLS();

export type CategoryRecord = typeof categories.$inferSelect;
export type AdminUserRecord = typeof adminUsers.$inferSelect;
export type CustomerProfileRecord = typeof customerProfiles.$inferSelect;
export type LoyaltySettingsRecord = typeof loyaltySettings.$inferSelect;
export type LoyaltyAccountRecord = typeof loyaltyAccounts.$inferSelect;
export type ProductRecord = typeof products.$inferSelect;
export type ComboRecord = typeof combos.$inferSelect;
export type ComboItemRecord = typeof comboItems.$inferSelect;
export type ComboImageRecord = typeof comboImages.$inferSelect;
export type StorefrontAssetRecord = typeof storefrontAssets.$inferSelect;
export type OrderRecord = typeof orders.$inferSelect;
export type OrderItemRecord = typeof orderItems.$inferSelect;
export type LoyaltyTransactionRecord = typeof loyaltyTransactions.$inferSelect;
export type PaymentRecord = typeof payments.$inferSelect;
export type StockReservationRecord = typeof stockReservations.$inferSelect;
export type StockReservationItemRecord = typeof stockReservationItems.$inferSelect;
