export type ProductType =
  | "miniature"
  | "mixer"
  | "glass"
  | "extra"
  | "accessory"
  | "supply";

export type CatalogCategory =
  | "combos"
  | "miniatures"
  | "glasses"
  | "mixers"
  | "extras"
  | "packs";

export type VisualVariant =
  | "fernet"
  | "jack"
  | "gin"
  | "vodka"
  | "tequila"
  | "coca"
  | "tonic"
  | "speed"
  | "glass"
  | "extra";

export type Category = {
  slug: CatalogCategory;
  name: string;
  description: string;
};

type CatalogBase = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  published: boolean;
  image: VisualVariant;
  category: CatalogCategory;
};

export type Product = CatalogBase & {
  kind: "product";
  stock: number;
  productType: ProductType;
  volume?: string;
};

export type ComboItem = {
  productId: string;
  quantity: number;
};

export type Combo = CatalogBase & {
  kind: "combo";
  components: ComboItem[];
  referencePrice: number;
  includesSurprise: true;
  optionalExtras?: string[];
};

export type CatalogItem = Product | Combo;
