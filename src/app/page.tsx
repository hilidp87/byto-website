import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { OutfitCategories } from "@/components/home/OutfitCategories";
import { FeaturedOutfits } from "@/components/home/FeaturedOutfits";
import { ProductCategories } from "@/components/home/ProductCategories";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { ShopTheLookBanner } from "@/components/home/ShopTheLookBanner";
import type { Product, Style } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [outfits, products] = await Promise.all([
    prisma.style.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    }),
    prisma.product.findMany({ take: 4, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <>
      <HeroSection />
      <OutfitCategories />
      <FeaturedOutfits outfits={outfits as unknown as Style[]} />
      <ProductCategories />
      <TrendingProducts products={products as unknown as Product[]} />
      <ShopTheLookBanner />
    </>
  );
}
