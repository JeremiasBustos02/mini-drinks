CREATE TYPE "public"."stock_reservation_status" AS ENUM('active', 'consumed', 'released');--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'payment_pending' BEFORE 'paid';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'payment_rejected' BEFORE 'paid';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'expired' BEFORE 'paid';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'manual_review' BEFORE 'paid';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'in_process' BEFORE 'approved';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'authorized' BEFORE 'approved';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'in_mediation' BEFORE 'approved';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'charged_back';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'unknown';--> statement-breakpoint
CREATE TABLE "stock_reservation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "stock_reservation_items_quantity_positive" CHECK ("stock_reservation_items"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "stock_reservation_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "stock_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"status" "stock_reservation_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"consumed_at" timestamp with time zone,
	"released_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "stock_reservations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_preference_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_init_point" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_preference_created_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_preference_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_preference_generation" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_preference_creation_key" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_preference_creation_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "preference_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "status_detail" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "currency" text DEFAULT 'ARS' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "date_approved" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "provider_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "stock_reservation_items" ADD CONSTRAINT "stock_reservation_items_reservation_id_stock_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."stock_reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_reservation_items" ADD CONSTRAINT "stock_reservation_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "stock_reservation_items_reservation_product_unique" ON "stock_reservation_items" USING btree ("reservation_id","product_id");--> statement-breakpoint
CREATE INDEX "stock_reservation_items_product_id_idx" ON "stock_reservation_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_reservations_order_id_unique" ON "stock_reservations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "stock_reservations_status_expires_at_idx" ON "stock_reservations" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_mercado_pago_preference_id_unique" ON "orders" USING btree ("mercado_pago_preference_id");--> statement-breakpoint
CREATE INDEX "orders_mercado_pago_preference_expires_at_idx" ON "orders" USING btree ("mercado_pago_preference_expires_at");--> statement-breakpoint
CREATE INDEX "payments_preference_id_idx" ON "payments" USING btree ("preference_id");
