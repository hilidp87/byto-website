"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import ProductsTable, { AdminProduct } from "@/components/admin/ProductsTable";

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load products");
        return r.json();
      })
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          <PlusIcon className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!products && !error ? (
        <div className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white" />
      ) : products ? (
        <ProductsTable
          products={products}
          onDeleted={(id) =>
            setProducts((prev) => prev?.filter((p) => p.id !== id) ?? null)
          }
        />
      ) : null}
    </div>
  );
}
