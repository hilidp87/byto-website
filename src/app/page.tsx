import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { OutfitCategories } from "@/components/home/OutfitCategories";
import { FeaturedOutfits } from "@/components/home/FeaturedOutfits";
import { ProductCategories } from "@/components/home/ProductCategories";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { ShopTheLookBanner } from "@/components/home/ShopTheLookBanner";
import {
  OutfitScrollShowcase,
  type ShowcaseLook,
} from "@/components/home/OutfitScrollShowcase";
import type { Product, Style } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let outfits: Style[] = [];
  let products: Product[] = [];
  let showcaseLooks: ShowcaseLook[] = [];

  try {
    const [fetchedOutfits, fetchedProducts, fetchedLooks] = await Promise.all([
      prisma.style.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      }),
      prisma.product.findMany({ take: 4, orderBy: { createdAt: "desc" } }),
      prisma.look.findMany({
        where: { active: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);
    outfits = fetchedOutfits as unknown as Style[];
    products = fetchedProducts as unknown as Product[];
    showcaseLooks = fetchedLooks.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      image: l.image,
      href: `/looks/${l.id}`,
    }));
  } catch {
    // DB may still be initialising on first boot — render the page without data
  }

  return (
    <>
      <HeroSection />
      <OutfitScrollShowcase looks={showcaseLooks} />
      <OutfitCategories />
      <FeaturedOutfits outfits={outfits} />
      <ProductCategories />
      <TrendingProducts products={products} />
      <ShopTheLookBanner />
    </>
  );
}
