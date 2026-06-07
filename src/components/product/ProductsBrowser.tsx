"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";
import type { Product } from "@/types";

export function ProductsBrowser({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let list = activeCategory
      ? products.filter((p) => p.category === activeCategory)
      : [...products];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCategory, sort]);

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <ProductFilters
        categories={categories}
        activeCategory={activeCategory}
        onCategory={setActiveCategory}
        sort={sort}
        onSort={setSort}
      />
      <div>
        <p className="mb-6 text-sm text-ink-muted">{filtered.length} products</p>
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}
