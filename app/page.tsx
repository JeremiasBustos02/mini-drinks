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

export default function Home() {
  return (
    <StorefrontShell>
      <main id="contenido">
        <Hero />
        <FeaturedCombos />
        <ShopCategories />
        <ComboBuilderPromo />
        <BrandBenefits />
        <PacksSection />
        <SurpriseSection />
        <GiftsEvents />
        <WholesaleCta />
        <FaqSection />
      </main>
    </StorefrontShell>
  );
}
