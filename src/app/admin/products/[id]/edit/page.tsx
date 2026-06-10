"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [initial, setInitial] = useState<Partial<ProductFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load product");
        return r.json();
      })
      .then((p) => {
        setInitial({
          title: p.title ?? "",
          description: p.description ?? "",
          category: p.category ?? "Accessories",
          brand: p.brand ?? "",
          material: p.material ?? "",
          price: p.price != null ? String(p.price) : "",
          comparePrice: p.comparePrice != null ? String(p.comparePrice) : "",
          stock: p.stock != null ? String(p.stock) : "",
          colors: (p.colors ?? []).join(", "),
          sizes: (p.sizes ?? []).join(", "),
          images: p.images ?? [],
          tags: p.tags ?? [],
        });
      })
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-gray-500 hover:text-sky-600"
        >
          ← Back to products
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Edit Product</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!initial && !error ? (
        <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-white" />
      ) : initial ? (
        <ProductForm initial={initial} productId={id} />
      ) : null}
    </div>
  );
}
