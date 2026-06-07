import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductsBrowser } from "@/components/product/ProductsBrowser";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "All Products",
  description: "Shop the full LOKYO collection of clothing, footwear and accessories.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-bold">All Products</h1>
        <p className="mt-2 text-ink-muted">Curated essentials and statement pieces.</p>
      </header>
      <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
        <ProductsBrowser products={products as unknown as Product[]} />
      </Suspense>
    </div>
  );
}
