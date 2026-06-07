import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

export function TrendingProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">Trending Now</h2>
          <p className="mt-2 text-ink-muted">The pieces everyone is wearing.</p>
        </div>
        <Link href="/products" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
