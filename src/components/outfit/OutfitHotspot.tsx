"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import type { Style } from "@/types";

export function OutfitHotspot({ outfit }: { outfit: Style }) {
  const router = useRouter();
  const [activeTip, setActiveTip] = useState<string | null>(null);

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-surface md:aspect-[4/3]">
      <Image
        src={outfit.coverImage}
        alt={outfit.title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {outfit.items.map((item) => {
        const isActive = activeTip === item.id;
        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${item.hotspotX}%`, top: `${item.hotspotY}%` }}
          >
            <button
              aria-label={`Shop ${item.product.title}`}
              onMouseEnter={() => setActiveTip(item.id)}
              onMouseLeave={() => setActiveTip(null)}
              onClick={() => {
                if (isActive) router.push(`/products/${item.product.slug}`);
                else setActiveTip(item.id);
              }}
              className="relative flex h-7 w-7 items-center justify-center"
            >
              <span className="absolute inline-flex h-7 w-7 rounded-full bg-primary/60 animate-pulseRing" />
              <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </button>

            {isActive && (
              <div
                className="absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 cursor-pointer whitespace-nowrap rounded-xl bg-white px-3 py-2 shadow-lg"
                onClick={() => router.push(`/products/${item.product.slug}`)}
              >
                <p className="text-xs font-medium text-ink">{item.product.title}</p>
                <p className="text-xs text-primary">{formatPrice(item.product.price)}</p>
                <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-white" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
