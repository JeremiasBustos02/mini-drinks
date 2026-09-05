import { z } from "zod";

import {
  CHECKOUT_MAX_COMPONENT_QUANTITY,
  CHECKOUT_MAX_LINE_QUANTITY,
} from "@/lib/checkout/limits";

const MAX_LINES = 30;
const MAX_COMPONENTS = 15;

const uuidSchema = z.uuid({ error: "El identificador no es válido." });
const quantitySchema = z.int().positive().max(CHECKOUT_MAX_LINE_QUANTITY);
const displayedUnitPriceSchema = z.int().nonnegative().optional();
const requiredText = (max: number) => z.string().trim().min(1).max(max);

export const customerSchema = z.strictObject({
  firstName: requiredText(80),
  lastName: requiredText(80),
  phone: requiredText(40).regex(/^[+\d][\d\s().-]{5,39}$/, "Ingresá un teléfono válido."),
  email: z.email().max(254),
});

const pickupSchema = z.strictObject({ type: z.literal("pickup") });
const deliverySchema = z.strictObject({
  type: z.literal("delivery"),
  address: z.strictObject({
    street: requiredText(120),
    number: requiredText(20),
    locality: requiredText(100),
    reference: z.string().trim().max(240).optional(),
  }),
});

export const fulfillmentSchema = z.discriminatedUnion("type", [pickupSchema, deliverySchema]);

const productLineSchema = z.strictObject({
  type: z.literal("product"),
  productId: uuidSchema,
  quantity: quantitySchema,
  displayedUnitPrice: displayedUnitPriceSchema,
});

const comboLineSchema = z.strictObject({
  type: z.literal("combo"),
  comboId: uuidSchema,
  quantity: quantitySchema,
  displayedUnitPrice: displayedUnitPriceSchema,
});

const customComboComponentSchema = z.strictObject({
  role: z.enum(["miniature", "mixer", "glass", "extra"]),
  productId: uuidSchema,
  quantity: z.int().positive().max(CHECKOUT_MAX_COMPONENT_QUANTITY),
});

export const customComboConfigurationSchema = z
  .array(customComboComponentSchema)
  .min(3)
  .max(MAX_COMPONENTS)
  .superRefine((components, context) => {
    const ids = new Set<string>();
    for (const component of components) {
      if (ids.has(component.productId)) {
        context.addIssue({
          code: "custom",
          message: "Un producto no puede repetirse dentro del mismo combo.",
        });
      }
      ids.add(component.productId);
    }

    for (const role of ["miniature", "mixer", "glass"] as const) {
      if (components.filter((component) => component.role === role).length !== 1) {
        context.addIssue({
          code: "custom",
          message: `El combo debe incluir exactamente un componente de tipo ${role}.`,
        });
      }
    }
  });

const customComboLineSchema = z.strictObject({
  type: z.literal("custom_combo"),
  components: customComboConfigurationSchema,
  quantity: quantitySchema,
  displayedUnitPrice: displayedUnitPriceSchema,
});

export const cartLineSchema = z.discriminatedUnion("type", [
  productLineSchema,
  comboLineSchema,
  customComboLineSchema,
]);

export const checkoutSchema = z.strictObject({
  checkoutAttemptId: uuidSchema,
  accessToken: uuidSchema,
  customer: customerSchema,
  fulfillment: fulfillmentSchema,
  notes: z.string().trim().max(500).optional(),
  lines: z.array(cartLineSchema).min(1).max(MAX_LINES),
});

export const createOrderSchema = checkoutSchema.extend({
  acceptedTotal: z.int().nonnegative(),
  acceptedQuoteHash: z.string().regex(/^[a-f0-9]{64}$/),
});

export type ValidCheckoutPayload = z.infer<typeof checkoutSchema>;
export type ValidCreateOrderPayload = z.infer<typeof createOrderSchema>;

export function getCheckoutFieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors;
}
