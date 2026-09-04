import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { categories, comboItems, combos, products } from "@/lib/db/schema";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const categorySeed = [
  {
    slug: "miniatures",
    name: "Miniaturas",
    description: "Bebidas en formato mini.",
    sortOrder: 10,
  },
  { slug: "mixers", name: "Mixers", description: "Bebidas para combinar.", sortOrder: 20 },
  {
    slug: "glasses",
    name: "Vasos",
    description: "Vasos para completar cada combo.",
    sortOrder: 30,
  },
  { slug: "extras", name: "Extras", description: "Agregados y accesorios.", sortOrder: 40 },
] as const;

const productSeed = [
  {
    categorySlug: "miniatures",
    slug: "fernet-branca-50ml",
    name: "Fernet Branca 50 ml",
    description: "La miniatura del clásico para resolver un fernet sin abrir una botella grande.",
    productType: "miniature",
    price: 390000,
    stock: 18,
  },
  {
    categorySlug: "miniatures",
    slug: "jack-daniels-50ml",
    name: "Jack Daniel's 50 ml",
    description: "Una mini de Tennessee whiskey para acompañar con tu mixer favorito.",
    productType: "miniature",
    price: 520000,
    stock: 9,
  },
  {
    categorySlug: "miniatures",
    slug: "gin-aviation-50ml",
    name: "Gin Aviation 50 ml",
    description: "Un gin suave y fresco en formato mini para mezclar sin vueltas.",
    productType: "miniature",
    price: 490000,
    stock: 12,
  },
  {
    categorySlug: "miniatures",
    slug: "titos-vodka-50ml",
    name: "Tito's Vodka 50 ml",
    description: "Vodka en mini para una mezcla simple y lista para la previa.",
    productType: "miniature",
    price: 450000,
    stock: 6,
  },
  {
    categorySlug: "mixers",
    slug: "coca-cola-lata",
    name: "Coca-Cola",
    description: "El mixer clásico para acompañar tu miniatura.",
    productType: "mixer",
    price: 150000,
    stock: 30,
  },
  {
    categorySlug: "mixers",
    slug: "agua-tonica",
    name: "Tónica",
    description: "Tónica fresca para un gin simple y bien servido.",
    productType: "mixer",
    price: 160000,
    stock: 20,
  },
  {
    categorySlug: "mixers",
    slug: "speed",
    name: "Speed",
    description: "El toque de energy para armar la previa en mini.",
    productType: "mixer",
    price: 180000,
    stock: 16,
  },
  {
    categorySlug: "glasses",
    slug: "vaso-mini",
    name: "Vaso Mini",
    description: "Un vaso simple, listo para acompañar cualquier combinación.",
    productType: "glass",
    price: 120000,
    stock: 50,
  },
] as const;

const comboSeed = [
  {
    slug: "combo-fernet-coca",
    name: "Fernet + Coca",
    description: "Fernet, Coca-Cola y vaso mini. El clásico ya resuelto.",
    promotionalPrice: 590000,
    productSlugs: ["fernet-branca-50ml", "coca-cola-lata", "vaso-mini"],
  },
  {
    slug: "combo-jack-coca",
    name: "Jack + Coca",
    description: "Jack Daniel's, Coca-Cola y vaso mini para hacerlo simple.",
    promotionalPrice: 740000,
    productSlugs: ["jack-daniels-50ml", "coca-cola-lata", "vaso-mini"],
  },
  {
    slug: "combo-gin-tonica",
    name: "Gin + Tónica",
    description: "Gin Aviation, agua tónica y vaso mini. Bien fresco.",
    promotionalPrice: 690000,
    productSlugs: ["gin-aviation-50ml", "agua-tonica", "vaso-mini"],
  },
  {
    slug: "combo-vodka-energy",
    name: "Vodka + Energy",
    description: "Tito's Vodka, Speed y vaso mini. Modo previa.",
    promotionalPrice: 680000,
    productSlugs: ["titos-vodka-50ml", "speed", "vaso-mini"],
  },
] as const;

async function seed() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to run the development seed.");
  }

  const client = postgres(connectionString, { max: 1, prepare: false });
  const database = drizzle(client);

  try {
    await database.transaction(async (tx) => {
      const categoryIds = new Map<string, string>();

      for (const category of categorySeed) {
        const [savedCategory] = await tx
          .insert(categories)
          .values({ ...category, active: true })
          .onConflictDoUpdate({
            target: categories.slug,
            set: {
              name: category.name,
              description: category.description,
              active: true,
              sortOrder: category.sortOrder,
              updatedAt: new Date(),
              version: sql`${categories.version} + 1`,
            },
          })
          .returning({ id: categories.id });

        categoryIds.set(category.slug, savedCategory.id);
      }

      const productIds = new Map<string, string>();

      for (const product of productSeed) {
        const categoryId = categoryIds.get(product.categorySlug);

        if (!categoryId) throw new Error(`Seed category not found: ${product.categorySlug}`);

        const [savedProduct] = await tx
          .insert(products)
          .values({
            categoryId,
            slug: product.slug,
            name: product.name,
            description: product.description,
            productType: product.productType,
            price: product.price,
            stock: product.stock,
            active: true,
            published: true,
          })
          .onConflictDoUpdate({
            target: products.slug,
            set: {
              categoryId,
              name: product.name,
              description: product.description,
              productType: product.productType,
              price: product.price,
              stock: product.stock,
              active: true,
              published: true,
              updatedAt: new Date(),
              version: sql`${products.version} + 1`,
            },
          })
          .returning({ id: products.id });

        productIds.set(product.slug, savedProduct.id);
      }

      for (const combo of comboSeed) {
        const [savedCombo] = await tx
          .insert(combos)
          .values({
            slug: combo.slug,
            name: combo.name,
            description: combo.description,
            promotionalPrice: combo.promotionalPrice,
            active: true,
            published: true,
          })
          .onConflictDoUpdate({
            target: combos.slug,
            set: {
              name: combo.name,
              description: combo.description,
              promotionalPrice: combo.promotionalPrice,
              active: true,
              published: true,
              updatedAt: new Date(),
            },
          })
          .returning({ id: combos.id });

        for (const productSlug of combo.productSlugs) {
          const productId = productIds.get(productSlug);

          if (!productId) throw new Error(`Seed product not found: ${productSlug}`);

          await tx
            .insert(comboItems)
            .values({ comboId: savedCombo.id, productId, quantity: 1 })
            .onConflictDoUpdate({
              target: [comboItems.comboId, comboItems.productId],
              set: { quantity: 1 },
            });
        }
      }
    });

    console.log("Development seed completed.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

seed().catch((error: unknown) => {
  console.error("Development seed failed.", error);
  process.exitCode = 1;
});
