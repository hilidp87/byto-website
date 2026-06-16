import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { OutfitCategories } from "@/components/home/OutfitCategories";
import { FeaturedOutfits } from "@/components/home/FeaturedOutfits";
import { ProductCategories } from "@/components/home/ProductCategories";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { ShopTheLookBanner } from "@/components/home/ShopTheLookBanner";
import { PublicTryOnAnimation } from "@/components/home/PublicTryOnAnimation";
import type { Product, Style, OutfitConfig } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let outfits: Style[] = [];
  let products: Product[] = [];
  let outfitConfigs: OutfitConfig[] = [];

  try {
    const [fetchedOutfits, fetchedProducts, fetchedConfigs] = await Promise.all([
      prisma.style.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      }),
      prisma.product.findMany({ take: 4, orderBy: { createdAt: "desc" } }),
      prisma.outfitConfig.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
    outfits = fetchedOutfits as unknown as Style[];
    products = fetchedProducts as unknown as Product[];
    outfitConfigs = fetchedConfigs.map((c) => ({
      ...c,
      updatedAt: c.updatedAt.toISOString(),
    })) as OutfitConfig[];
  } catch {
    // DB may still be initialising on first boot — render the page without data
  }

  return (
    <>
      <HeroSection />
      <PublicTryOnAnimation configs={outfitConfigs} />
      <OutfitCategories />
      <FeaturedOutfits outfits={outfits} />
      <ProductCategories />
      <TrendingProducts products={products} />
      <ShopTheLookBanner />
    </>
  );
}
