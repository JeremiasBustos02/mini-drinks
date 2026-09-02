import { combos } from "@/data/combos";
import { products } from "@/data/products";

export { categories } from "@/data/categories";
export { combos } from "@/data/combos";
export { products } from "@/data/products";

export const catalogItems = [...combos, ...products].filter(
  (item) => item.published,
);
