CREATE TABLE "loyalty_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_profile_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"lifetime_earned_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_accounts_balance_non_negative" CHECK ("loyalty_accounts"."balance" >= 0),
	CONSTRAINT "loyalty_accounts_lifetime_earned_points_non_negative" CHECK ("loyalty_accounts"."lifetime_earned_points" >= 0)
);
--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "loyalty_settings" (
	"key" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"earn_unit_cents" bigint NOT NULL,
	"points_per_unit" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_settings_singleton" CHECK ("loyalty_settings"."key" = 'default'),
	CONSTRAINT "loyalty_settings_earn_unit_cents_positive" CHECK ("loyalty_settings"."earn_unit_cents" > 0),
	CONSTRAINT "loyalty_settings_points_per_unit_positive" CHECK ("loyalty_settings"."points_per_unit" > 0)
);
--> statement-breakpoint
ALTER TABLE "loyalty_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
INSERT INTO "loyalty_settings" ("key", "earn_unit_cents", "points_per_unit")
VALUES ('default', 100000, 1)
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
CREATE TABLE "loyalty_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loyalty_account_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"type" text DEFAULT 'earn' NOT NULL,
	"points" integer NOT NULL,
	"earn_unit_cents" bigint NOT NULL,
	"points_per_unit" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_transactions_type_earn" CHECK ("loyalty_transactions"."type" = 'earn'),
	CONSTRAINT "loyalty_transactions_points_positive" CHECK ("loyalty_transactions"."points" > 0),
	CONSTRAINT "loyalty_transactions_earn_unit_cents_positive" CHECK ("loyalty_transactions"."earn_unit_cents" > 0),
	CONSTRAINT "loyalty_transactions_points_per_unit_positive" CHECK ("loyalty_transactions"."points_per_unit" > 0)
);
--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_profile_id" uuid;--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_customer_profile_id_customer_profiles_id_fk" FOREIGN KEY ("customer_profile_id") REFERENCES "public"."customer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_loyalty_account_id_loyalty_accounts_id_fk" FOREIGN KEY ("loyalty_account_id") REFERENCES "public"."loyalty_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "loyalty_accounts_customer_profile_id_unique" ON "loyalty_accounts" USING btree ("customer_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "loyalty_transactions_idempotency_key_unique" ON "loyalty_transactions" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_order_id_idx" ON "loyalty_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "loyalty_transactions_account_created_at_idx" ON "loyalty_transactions" USING btree ("loyalty_account_id","created_at");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_profile_id_customer_profiles_id_fk" FOREIGN KEY ("customer_profile_id") REFERENCES "public"."customer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_customer_profile_id_created_at_idx" ON "orders" USING btree ("customer_profile_id","created_at");
