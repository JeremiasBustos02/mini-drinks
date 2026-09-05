CREATE TABLE "combo_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"combo_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"storage_path" text,
	"alt" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "combo_images_sort_order_non_negative" CHECK ("combo_images"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "combo_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storefront_assets" (
	"key" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"storage_path" text,
	"alt" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storefront_assets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "combo_images" ADD CONSTRAINT "combo_images_combo_id_combos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "combo_images_combo_sort_idx" ON "combo_images" USING btree ("combo_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "combo_images_one_primary_per_combo" ON "combo_images" USING btree ("combo_id") WHERE "combo_images"."is_primary" = true;
--> statement-breakpoint
INSERT INTO "combo_images" ("combo_id", "image_url", "alt", "sort_order", "is_primary")
SELECT "id", "image_url", "name", 0, true
FROM "combos"
WHERE nullif(btrim("image_url"), '') IS NOT NULL;
