import { z } from "zod";

import { parseArsToCents } from "@/lib/money";
import { productTypeValues } from "@/types/domain";

const requiredText = z.string().trim().min(1, "Este campo es obligatorio.");
const slug = requiredText.regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Usá minúsculas, números y guiones, sin espacios.",
);
const checkbox = z.preprocess((value) => value === "on" || value === true, z.boolean());
const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.url("Ingresá una URL válida.").nullable(),
);
const money = z.string().trim().transform((value, context) => {
  try {
    return parseArsToCents(value);
  } catch (error) {
    context.addIssue({
      code: "custom",
      message: error instanceof Error ? error.message : "Importe inválido.",
    });
    return z.NEVER;
  }
});

export const loginSchema = z.object({
  email: z.email("Ingresá un email válido."),
  password: z.string().min(1, "Ingresá la contraseña."),
});

export const categorySchema = z.object({
  id: z.preprocess((value) => value || undefined, z.uuid().optional()),
  revision: z.preprocess((value) => value || undefined, z.coerce.date().optional()),
  name: requiredText,
  slug,
  description: z.string().trim(),
  sortOrder: z.coerce.number().int().min(0, "El orden no puede ser negativo."),
  active: checkbox,
});

export const productSchema = z.object({
  id: z.preprocess((value) => value || undefined, z.uuid().optional()),
  revision: z.preprocess((value) => value || undefined, z.coerce.date().optional()),
  name: requiredText,
  slug,
  description: requiredText,
  categoryId: z.uuid("Elegí una categoría."),
  productType: z.enum(productTypeValues),
  price: money,
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
  active: checkbox,
  published: checkbox,
  imageUrl: optionalUrl,
});

export const comboComponentSchema = z.object({
  productId: z.uuid("Producto inválido."),
  quantity: z.number().int().positive("La cantidad debe ser mayor a cero."),
});

export const comboComponentsSchema = z
  .array(comboComponentSchema)
  .min(1, "Agregá al menos un componente.")
  .superRefine((components, context) => {
    const seen = new Set<string>();
    components.forEach((component, index) => {
      if (seen.has(component.productId)) {
        context.addIssue({
          code: "custom",
          message: "No se puede repetir el mismo producto.",
          path: [index, "productId"],
        });
      }
      seen.add(component.productId);
    });
  });

export const comboSchema = z.object({
  id: z.preprocess((value) => value || undefined, z.uuid().optional()),
  revision: z.preprocess((value) => value || undefined, z.coerce.date().optional()),
  name: requiredText,
  slug,
  description: requiredText,
  promotionalPrice: z
    .string()
    .trim()
    .transform((value, context) => {
      if (value === "") return null;
      try {
        return parseArsToCents(value);
      } catch (error) {
        context.addIssue({
          code: "custom",
          message: error instanceof Error ? error.message : "Importe inválido.",
        });
        return z.NEVER;
      }
    }),
  active: checkbox,
  published: checkbox,
  imageUrl: optionalUrl,
  components: z.string().transform((value, context) => {
    try {
      return comboComponentsSchema.parse(JSON.parse(value));
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => context.addIssue({ code: "custom", message: issue.message }));
      } else {
        context.addIssue({ code: "custom", message: "Los componentes no son válidos." });
      }
      return z.NEVER;
    }
  }),
});

export const stateChangeSchema = z.object({
  id: z.uuid(),
  revision: z.coerce.date(),
  field: z.enum(["active", "published"]),
  value: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const categoryStateChangeSchema = stateChangeSchema.omit({ field: true });

export function firstValidationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Revisá los datos ingresados.";
}
