import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { OutfitCategories } from "@/components/home/OutfitCategories";
import { FeaturedOutfits } from "@/components/home/FeaturedOutfits";
import { ProductCategories } from "@/components/home/ProductCategories";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { ShopTheLookBanner } from "@/components/home/ShopTheLookBanner";
import { OutfitScrollShowcase } from "@/components/home/OutfitScrollShowcase";
import type { Product, Style } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let outfits: Style[] = [];
  let products: Product[] = [];

  try {
    const [fetchedOutfits, fetchedProducts] = await Promise.all([
      prisma.style.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      }),
      prisma.product.findMany({ take: 4, orderBy: { createdAt: "desc" } }),
    ]);
    outfits = fetchedOutfits as unknown as Style[];
    products = fetchedProducts as unknown as Product[];
  } catch {
    // DB may still be initialising on first boot — render the page without data
  }

  return (
    <>
      <HeroSection />
      <OutfitScrollShowcase />
      <OutfitCategories />
      <FeaturedOutfits outfits={outfits} />
      <ProductCategories />
      <TrendingProducts products={products} />
      <ShopTheLookBanner />
    </>
  );
}
