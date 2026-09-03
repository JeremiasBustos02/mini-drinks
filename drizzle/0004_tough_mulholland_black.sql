ALTER TABLE "orders" ADD COLUMN "checkout_attempt_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "access_token_hash" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "checkout_request_hash" text;--> statement-breakpoint
UPDATE "orders" SET "access_token_hash" = md5("checkout_attempt_id"::text) || md5("public_number" || "checkout_attempt_id"::text);--> statement-breakpoint
UPDATE "orders" SET "checkout_request_hash" = md5("public_number") || md5("checkout_attempt_id"::text);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "access_token_hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "checkout_request_hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "checkout_attempt_id" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_checkout_attempt_id_unique" ON "orders" USING btree ("checkout_attempt_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_access_token_hash_unique" ON "orders" USING btree ("access_token_hash");
