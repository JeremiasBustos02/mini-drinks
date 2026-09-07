CREATE TYPE "public"."loyalty_redemption_status" AS ENUM('reserved', 'redeemed', 'released');--> statement-breakpoint
CREATE TABLE "loyalty_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_profile_id" uuid NOT NULL,
	"loyalty_account_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"points" integer NOT NULL,
	"discount_cents" bigint NOT NULL,
	"redemption_value_cents" bigint NOT NULL,
	"min_redemption_points" integer NOT NULL,
	"redemption_step_points" integer NOT NULL,
	"max_redemption_percentage" integer NOT NULL,
	"status" "loyalty_redemption_status" DEFAULT 'reserved' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"redeemed_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_redemptions_points_positive" CHECK ("loyalty_redemptions"."points" > 0),
	CONSTRAINT "loyalty_redemptions_discount_positive" CHECK ("loyalty_redemptions"."discount_cents" > 0),
	CONSTRAINT "loyalty_redemptions_status_timestamps" CHECK (("loyalty_redemptions"."status" = 'reserved' and "loyalty_redemptions"."redeemed_at" is null and "loyalty_redemptions"."released_at" is null) or ("loyalty_redemptions"."status" = 'redeemed' and "loyalty_redemptions"."redeemed_at" is not null and "loyalty_redemptions"."released_at" is null) or ("loyalty_redemptions"."status" = 'released' and "loyalty_redemptions"."released_at" is not null and "loyalty_redemptions"."redeemed_at" is null))
);
--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" DROP CONSTRAINT "loyalty_transactions_type_supported";--> statement-breakpoint
ALTER TABLE "loyalty_settings" ADD COLUMN "redemption_value_cents" bigint DEFAULT 40 NOT NULL;--> statement-breakpoint
ALTER TABLE "loyalty_settings" ADD COLUMN "min_redemption_points" integer DEFAULT 2500 NOT NULL;--> statement-breakpoint
ALTER TABLE "loyalty_settings" ADD COLUMN "redemption_step_points" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "loyalty_settings" ADD COLUMN "max_redemption_percentage" integer DEFAULT 20 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "loyalty_redemption_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "loyalty_redemption_discount" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "loyalty_redemption_value_cents" bigint;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "loyalty_min_redemption_points" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "loyalty_redemption_step_points" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "loyalty_max_redemption_percentage" integer;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_customer_profile_id_customer_profiles_id_fk" FOREIGN KEY ("customer_profile_id") REFERENCES "public"."customer_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_loyalty_account_id_loyalty_accounts_id_fk" FOREIGN KEY ("loyalty_account_id") REFERENCES "public"."loyalty_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "loyalty_redemptions_order_id_unique" ON "loyalty_redemptions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "loyalty_redemptions_account_status_idx" ON "loyalty_redemptions" USING btree ("loyalty_account_id","status");--> statement-breakpoint
CREATE INDEX "loyalty_redemptions_expires_at_idx" ON "loyalty_redemptions" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "loyalty_settings" ADD CONSTRAINT "loyalty_settings_redemption_value_cents_positive" CHECK ("loyalty_settings"."redemption_value_cents" > 0);--> statement-breakpoint
ALTER TABLE "loyalty_settings" ADD CONSTRAINT "loyalty_settings_min_redemption_points_positive" CHECK ("loyalty_settings"."min_redemption_points" > 0);--> statement-breakpoint
ALTER TABLE "loyalty_settings" ADD CONSTRAINT "loyalty_settings_redemption_step_points_positive" CHECK ("loyalty_settings"."redemption_step_points" > 0);--> statement-breakpoint
ALTER TABLE "loyalty_settings" ADD CONSTRAINT "loyalty_settings_max_redemption_percentage_range" CHECK ("loyalty_settings"."max_redemption_percentage" > 0 and "loyalty_settings"."max_redemption_percentage" <= 100);--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_type_supported" CHECK ("loyalty_transactions"."type" in ('earn', 'code_reward', 'redeem'));--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_loyalty_redemption_points_non_negative" CHECK ("orders"."loyalty_redemption_points" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_loyalty_redemption_discount_non_negative" CHECK ("orders"."loyalty_redemption_discount" >= 0 and "orders"."loyalty_redemption_discount" <= "orders"."subtotal");
