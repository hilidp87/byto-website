import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { OutfitsBrowser } from "@/components/outfit/OutfitsBrowser";
import type { Style } from "@/types";

export const metadata: Metadata = {
  title: "Outfits",
  description: "Explore curated LOKYO outfits. Shop the look in one tap.",
};

export const dynamic = "force-dynamic";

export default async function OutfitsPage() {
  const outfits = await prisma.style.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-bold">Curated Outfits</h1>
        <p className="mt-2 text-ink-muted">Complete looks, ready to shop the moment.</p>
      </header>
      <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
        <OutfitsBrowser outfits={outfits as unknown as Style[]} />
      </Suspense>
    </div>
  );
}
