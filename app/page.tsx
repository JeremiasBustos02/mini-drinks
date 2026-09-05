import { BrandBenefits } from "@/components/home/brand-benefits";
import { ComboBuilderPromo } from "@/components/home/combo-builder-promo";
import { FaqSection } from "@/components/home/faq-section";
import { FeaturedCombos } from "@/components/home/featured-combos";
import { GiftsEvents } from "@/components/home/gifts-events";
import { Hero } from "@/components/home/hero";
import { PacksSection } from "@/components/home/packs-section";
import { ShopCategories } from "@/components/home/shop-categories";
import { SurpriseSection } from "@/components/home/surprise-section";
import { WholesaleCta } from "@/components/home/wholesale-cta";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { getStorefrontAssets } from "@/lib/db/queries/storefront-assets";

export default async function Home() {
  const assets = await getStorefrontAssets();
  return (
    <StorefrontShell>
      <main id="contenido">
        <Hero asset={assets.hero} />
        <FeaturedCombos />
        <ShopCategories />
        <ComboBuilderPromo asset={assets.combo_builder_promo} />
        <BrandBenefits />
        <PacksSection asset={assets.packs} />
        <SurpriseSection />
        <GiftsEvents asset={assets.gifts_events} />
        <WholesaleCta asset={assets.wholesale} />
        <FaqSection />
      </main>
    </StorefrontShell>
  );
}
