export const storefrontAssetKeys = [
  "hero",
  "combo_builder_promo",
  "wholesale",
  "packs",
  "gifts_events",
] as const;

export type StorefrontAssetKey = (typeof storefrontAssetKeys)[number];

export type StorefrontAsset = {
  key: StorefrontAssetKey;
  imageUrl: string;
  alt: string;
};

export const storefrontAssetDefinitions: Record<
  StorefrontAssetKey,
  { label: string; description: string; fallbackUrl: string | null }
> = {
  hero: {
    label: "Hero",
    description: "Imagen editorial principal de la home.",
    fallbackUrl: "/background-hero.webp",
  },
  combo_builder_promo: {
    label: "Promo Armá tu combo",
    description: "Composición visual que acompaña la invitación al builder.",
    fallbackUrl: null,
  },
  wholesale: {
    label: "Mayoristas",
    description: "Imagen editorial para comercios y reventa.",
    fallbackUrl: null,
  },
  packs: {
    label: "Packs",
    description: "Composición general para la sección de packs.",
    fallbackUrl: null,
  },
  gifts_events: {
    label: "Regalos y eventos",
    description: "Lifestyle para regalos, celebraciones y eventos.",
    fallbackUrl: null,
  },
};

export function isStorefrontAssetKey(value: string): value is StorefrontAssetKey {
  return storefrontAssetKeys.includes(value as StorefrontAssetKey);
}
