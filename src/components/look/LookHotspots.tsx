"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Hotspot = {
  id: string;
  x: number;
  y: number;
  label: string | null;
  product: { slug: string; title: string; price: number };
};

function formatToman(price: number): string {
  return `${price.toLocaleString("fa-IR")} تومان`;
}

export default function LookHotspots({
  lookId,
  image,
  title,
  hotspots,
}: {
  lookId: string;
  image: string;
  title: string;
  hotspots: Hotspot[];
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);

  async function go(h: Hotspot) {
    try {
      await fetch(`/api/looks/${lookId}/click/${h.id}`, { method: "POST" });
    } catch {
      // tracking is best-effort
    }
    router.push(`/products/${h.product.slug}`);
  }

  function handleClick(e: React.MouseEvent, h: Hotspot) {
    e.preventDefault();
    // Mobile-friendly: first tap shows tooltip, second tap navigates.
    if (activeId === h.id) {
      go(h);
    } else {
      setActiveId(h.id);
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={title} className="w-full select-none" draggable={false} />

      {hotspots.map((h) => (
        <button
          key={h.id}
          onClick={(e) => handleClick(e, h)}
          onMouseEnter={() => setActiveId(h.id)}
          onMouseLeave={() => setActiveId((c) => (c === h.id ? null : c))}
          className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
          aria-label={h.product.title}
        >
          <span className="relative flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-5 w-5 rounded-full bg-sky-500 ring-2 ring-white" />
          </span>
          <span
            className={`pointer-events-none absolute bottom-7 right-1/2 translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg ${
              activeId === h.id ? "block" : "hidden"
            }`}
          >
            {h.label || h.product.title} — {formatToman(h.product.price)}
          </span>
        </button>
      ))}
    </div>
  );
}
