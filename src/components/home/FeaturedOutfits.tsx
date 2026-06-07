import Link from "next/link";
import { OutfitCard } from "@/components/outfit/OutfitCard";
import type { Style } from "@/types";

export function FeaturedOutfits({ outfits }: { outfits: Style[] }) {
  if (outfits.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">Featured Outfits</h2>
          <p className="mt-2 text-ink-muted">Editor-curated looks, ready to shop.</p>
        </div>
        <Link href="/outfits" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {outfits.slice(0, 3).map((o) => (
          <OutfitCard key={o.id} outfit={o} />
        ))}
      </div>
    </section>
  );
}
