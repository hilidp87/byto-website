"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OutfitCard } from "./OutfitCard";
import { cn } from "@/lib/utils";
import type { Style } from "@/types";

export function OutfitsBrowser({ outfits }: { outfits: Style[] }) {
  const searchParams = useSearchParams();
  const initial = searchParams.get("category");

  const categories = useMemo(
    () => Array.from(new Set(outfits.map((o) => o.category))).sort(),
    [outfits]
  );
  const [active, setActive] = useState<string | null>(initial);

  const filtered = active ? outfits.filter((o) => o.category === active) : outfits;

  return (
    <div>
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
        <FilterChip label="All" active={!active} onClick={() => setActive(null)} />
        {categories.map((c) => (
          <FilterChip key={c} label={c} active={active === c} onClick={() => setActive(c)} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-ink-muted">No outfits in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OutfitCard key={o.id} outfit={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-primary bg-primary text-white"
          : "border-line bg-white text-ink hover:border-ink"
      )}
    >
      {label}
    </button>
  );
}
