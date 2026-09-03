import { z } from "zod";

import { productTypeValues } from "@/types/domain";
import type { OrderItemConfigurationSnapshot } from "@/types/checkout";

const moneySchema = z.int().nonnegative();
const componentSchema = z.strictObject({
  productId: z.uuid(),
  name: z.string().min(1).max(200),
  productType: z.enum(productTypeValues),
  quantity: z.int().positive(),
  unitPrice: moneySchema,
});

export const orderItemConfigurationSnapshotSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    version: z.literal(1),
    kind: z.literal("preset_combo"),
    components: z.array(componentSchema).min(1).max(50),
    referencePrice: moneySchema,
    promotionalPrice: moneySchema.nullable(),
  }),
  z.strictObject({
    version: z.literal(1),
    kind: z.literal("custom_combo"),
    baseComponents: z.array(componentSchema).min(1).max(20),
    extras: z.array(componentSchema).max(30),
    individualBasePrice: moneySchema,
    extrasPrice: moneySchema,
    matchedCombo: z.strictObject({ id: z.uuid(), name: z.string().min(1).max(200) }).nullable(),
    savings: moneySchema,
  }),
]);

export function parseOrderItemConfigurationSnapshot(
  value: unknown,
): OrderItemConfigurationSnapshot | null {
  const parsed = orderItemConfigurationSnapshotSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
