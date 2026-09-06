UPDATE "loyalty_settings"
SET "points_per_unit" = "points_per_unit" * 100,
    "updated_at" = now();--> statement-breakpoint
UPDATE "loyalty_accounts"
SET "balance" = "balance" * 100,
    "lifetime_earned_points" = "lifetime_earned_points" * 100,
    "updated_at" = now();--> statement-breakpoint
UPDATE "loyalty_transactions"
SET "points" = "points" * 100,
    "points_per_unit" = "points_per_unit" * 100;--> statement-breakpoint
UPDATE "reward_codes"
SET "reward_points" = "reward_points" * 100;
