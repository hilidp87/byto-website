"use client";

import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  categories: string[];
  activeCategory: string | null;
  onCategory: (c: string | null) => void;
  sort: string;
  onSort: (s: string) => void;
}

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ProductFilters({
  categories,
  activeCategory,
  onCategory,
  sort,
  onSort,
}: ProductFiltersProps) {
  return (
    <aside className="space-y-8">
      <div>
        <h3 className="font-sans text-sm font-semibold text-ink">Category</h3>
        <ul className="mt-3 space-y-1">
          <li>
            <button
              onClick={() => onCategory(null)}
              className={cn(
                "text-sm",
                !activeCategory ? "font-semibold text-primary" : "text-ink-muted hover:text-ink"
              )}
            >
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <button
                onClick={() => onCategory(c)}
                className={cn(
                  "text-sm",
                  activeCategory === c
                    ? "font-semibold text-primary"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-sans text-sm font-semibold text-ink">Sort by</h3>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
