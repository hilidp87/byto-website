import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OutfitHotspot } from "@/components/outfit/OutfitHotspot";
import { ShopTheLook } from "@/components/outfit/ShopTheLook";
import { OutfitCard } from "@/components/outfit/OutfitCard";
import { Badge } from "@/components/ui/Badge";
import type { Style } from "@/types";

export const revalidate = 60;

async function getOutfit(slug: string) {
  return prisma.style.findUnique({
    where: { slug },
    include: { items: { include: { product: true } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const outfit = await prisma.style.findUnique({ where: { slug: params.slug } });
  if (!outfit) return { title: "Outfit Not Found" };
  return {
    title: outfit.title,
    description: outfit.description.slice(0, 160),
  };
}

export default async function OutfitDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const outfit = await getOutfit(params.slug);
  if (!outfit) notFound();

  const related = await prisma.style.findMany({
    where: { category: outfit.category, NOT: { id: outfit.id } },
    take: 3,
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <OutfitHotspot outfit={outfit as unknown as Style} />
        <div className="flex flex-col justify-center">
          <Badge variant="primary" className="w-fit">
            {outfit.category}
          </Badge>
          <h1 className="mt-4 font-serif text-5xl font-bold">{outfit.title}</h1>
          <p className="mt-4 leading-relaxed text-ink-muted">{outfit.description}</p>
          <div className="mt-6 flex gap-6 text-sm text-ink-muted">
            {outfit.season && (
              <span>
                <span className="font-medium text-ink">Season:</span> {outfit.season}
              </span>
            )}
            {outfit.occasion && (
              <span>
                <span className="font-medium text-ink">Occasion:</span> {outfit.occasion}
              </span>
            )}
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            Tap any dot on the photo to shop that piece.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <ShopTheLook outfit={outfit as unknown as Style} />
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-serif text-3xl font-bold">You May Also Like</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((o) => (
              <OutfitCard key={o.id} outfit={o as unknown as Style} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
