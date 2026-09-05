CREATE TYPE "public"."reward_campaign_status" AS ENUM('draft', 'active', 'paused', 'ended');--> statement-breakpoint
CREATE TYPE "public"."reward_type" AS ENUM('points', 'discount_percent', 'discount_fixed', 'free_shipping', 'multiplier', 'special');--> statement-breakpoint
CREATE TABLE "reward_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "reward_campaign_status" DEFAULT 'draft' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reward_campaigns_dates_valid" CHECK ("reward_campaigns"."ends_at" is null or "reward_campaigns"."starts_at" is null or "reward_campaigns"."ends_at" > "reward_campaigns"."starts_at")
);
--> statement-breakpoint
ALTER TABLE "reward_campaigns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reward_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"display_code" text,
	"reward_type" "reward_type" DEFAULT 'points' NOT NULL,
	"reward_points" integer NOT NULL,
	"redeemed_at" timestamp with time zone,
	"redeemed_by_customer_profile_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reward_codes_points_positive" CHECK ("reward_codes"."reward_points" > 0),
	CONSTRAINT "reward_codes_redemption_pair" CHECK (("reward_codes"."redeemed_at" is null) = ("reward_codes"."redeemed_by_customer_profile_id" is null))
);
--> statement-breakpoint
ALTER TABLE "reward_codes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" DROP CONSTRAINT "loyalty_transactions_type_earn";--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ALTER COLUMN "order_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD COLUMN "reward_code_id" uuid;--> statement-breakpoint
ALTER TABLE "reward_codes" ADD CONSTRAINT "reward_codes_campaign_id_reward_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."reward_campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_codes" ADD CONSTRAINT "reward_codes_redeemed_by_customer_profile_id_customer_profiles_id_fk" FOREIGN KEY ("redeemed_by_customer_profile_id") REFERENCES "public"."customer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reward_codes_token_hash_unique" ON "reward_codes" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "reward_codes_campaign_id_idx" ON "reward_codes" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "reward_codes_redeemed_by_customer_profile_id_idx" ON "reward_codes" USING btree ("redeemed_by_customer_profile_id");--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_reward_code_id_reward_codes_id_fk" FOREIGN KEY ("reward_code_id") REFERENCES "public"."reward_codes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "loyalty_transactions_reward_code_id_unique" ON "loyalty_transactions" USING btree ("reward_code_id");--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_type_supported" CHECK ("loyalty_transactions"."type" in ('earn', 'code_reward'));
