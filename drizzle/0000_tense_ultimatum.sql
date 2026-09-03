CREATE TYPE "public"."delivery_type" AS ENUM('delivery', 'pickup');--> statement-breakpoint
CREATE TYPE "public"."order_item_type" AS ENUM('product', 'combo', 'custom_combo', 'pack');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending_payment', 'paid', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('miniature', 'mixer', 'glass', 'extra', 'accessory', 'supply');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_sort_order_non_negative" CHECK ("categories"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "combo_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"combo_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "combo_items_quantity_positive" CHECK ("combo_items"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "combo_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "combos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"promotional_price" bigint,
	"active" boolean DEFAULT true NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "combos_promotional_price_safe_range" CHECK ("combos"."promotional_price" is null or ("combos"."promotional_price" >= 0 and "combos"."promotional_price" <= 9007199254740991))
);
--> statement-breakpoint
ALTER TABLE "combos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"item_type" "order_item_type" NOT NULL,
	"reference_id" uuid,
	"display_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" bigint NOT NULL,
	"subtotal" bigint NOT NULL,
	"configuration_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_unit_price_safe_range" CHECK ("order_items"."unit_price" >= 0 and "order_items"."unit_price" <= 9007199254740991),
	CONSTRAINT "order_items_subtotal_safe_range" CHECK ("order_items"."subtotal" >= 0 and "order_items"."subtotal" <= 9007199254740991),
	CONSTRAINT "order_items_subtotal_matches_quantity" CHECK ("order_items"."subtotal" = "order_items"."unit_price" * "order_items"."quantity")
);
--> statement-breakpoint
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_number" text NOT NULL,
	"status" "order_status" DEFAULT 'pending_payment' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_last_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_email" text,
	"customer_document" text,
	"delivery_type" "delivery_type" NOT NULL,
	"delivery_address" text,
	"city" text,
	"notes" text,
	"subtotal" bigint NOT NULL,
	"discount_total" bigint DEFAULT 0 NOT NULL,
	"delivery_total" bigint DEFAULT 0 NOT NULL,
	"total" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_subtotal_safe_range" CHECK ("orders"."subtotal" >= 0 and "orders"."subtotal" <= 9007199254740991),
	CONSTRAINT "orders_discount_total_safe_range" CHECK ("orders"."discount_total" >= 0 and "orders"."discount_total" <= 9007199254740991),
	CONSTRAINT "orders_delivery_total_safe_range" CHECK ("orders"."delivery_total" >= 0 and "orders"."delivery_total" <= 9007199254740991),
	CONSTRAINT "orders_total_safe_range" CHECK ("orders"."total" >= 0 and "orders"."total" <= 9007199254740991),
	CONSTRAINT "orders_discount_not_greater_than_subtotal" CHECK ("orders"."discount_total" <= "orders"."subtotal"),
	CONSTRAINT "orders_total_matches_components" CHECK ("orders"."total" = "orders"."subtotal" - "orders"."discount_total" + "orders"."delivery_total"),
	CONSTRAINT "orders_delivery_details_required" CHECK ("orders"."delivery_type" = 'pickup' or (nullif(btrim("orders"."delivery_address"), '') is not null and nullif(btrim("orders"."city"), '') is not null))
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_payment_id" text,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" bigint NOT NULL,
	"raw_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_safe_range" CHECK ("payments"."amount" >= 0 and "payments"."amount" <= 9007199254740991)
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"product_type" "product_type" NOT NULL,
	"price" bigint NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_price_safe_range" CHECK ("products"."price" >= 0 and "products"."price" <= 9007199254740991),
	CONSTRAINT "products_stock_non_negative" CHECK ("products"."stock" >= 0)
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "combo_items" ADD CONSTRAINT "combo_items_combo_id_combos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_items" ADD CONSTRAINT "combo_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "combo_items_combo_product_unique" ON "combo_items" USING btree ("combo_id","product_id");--> statement-breakpoint
CREATE INDEX "combo_items_product_id_idx" ON "combo_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "combos_slug_unique" ON "combos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "combos_published_active_idx" ON "combos" USING btree ("published","active");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_public_number_unique" ON "orders" USING btree ("public_number");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_payment_id_unique" ON "payments" USING btree ("provider_payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_unique" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_published_active_idx" ON "products" USING btree ("published","active");