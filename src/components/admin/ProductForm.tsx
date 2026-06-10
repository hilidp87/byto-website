"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";

const CATEGORIES = [
  "Pants",
  "Jeans",
  "T-Shirts",
  "Shirts",
  "Hoodies",
  "Jackets",
  "Sneakers",
  "Boots",
  "Accessories",
  "Watches",
  "Bags",
  "Hats",
  "Sunglasses",
];

const ALL_TAGS = ["New", "Best Seller", "Limited Edition"];

export type ProductFormData = {
  id?: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  material: string;
  price: string;
  comparePrice: string;
  stock: string;
  colors: string;
  sizes: string;
  images: string[];
  tags: string[];
};

const EMPTY: ProductFormData = {
  title: "",
  description: "",
  category: "Accessories",
  brand: "",
  material: "",
  price: "",
  comparePrice: "",
  stock: "",
  colors: "",
  sizes: "",
  images: ["", "", "", "", ""],
  tags: [],
};

function toArray(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ProductForm({
  initial,
  productId,
}: {
  initial?: Partial<ProductFormData>;
  productId?: string;
}) {
  const router = useRouter();
  const merged: ProductFormData = {
    ...EMPTY,
    ...initial,
    images: [...(initial?.images ?? []), "", "", "", "", ""].slice(0, 5),
  };

  const [form, setForm] = useState<ProductFormData>(merged);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setImage(idx: number, value: string) {
    setForm((f) => {
      const images = [...f.images];
      images[idx] = value;
      return { ...f, images };
    });
  }

  function toggleTag(tag: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      description: form.description,
      category: form.category,
      brand: form.brand,
      material: form.material,
      price: Number(form.price) || 0,
      comparePrice: form.comparePrice === "" ? null : Number(form.comparePrice),
      stock: Number(form.stock) || 0,
      colors: toArray(form.colors),
      sizes: toArray(form.sizes),
      images: form.images.filter((s) => s.trim()),
      tags: form.tags,
    };

    try {
      const url = productId
        ? `/api/admin/products/${productId}`
        : "/api/admin/products";
      const res = await fetch(url, {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save product");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";
  const labelCls = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelCls}>Title</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea
              rows={4}
              className={inputCls}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <select
              className={inputCls}
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Brand</label>
            <input
              className={inputCls}
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Material</label>
            <input
              className={inputCls}
              value={form.material}
              onChange={(e) => update("material", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Stock / Inventory</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Price ($)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputCls}
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Compare / Discounted Price ($)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputCls}
              value={form.comparePrice}
              onChange={(e) => update("comparePrice", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Colors (comma separated)</label>
            <input
              className={inputCls}
              placeholder="Black, White, Navy"
              value={form.colors}
              onChange={(e) => update("colors", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Sizes (comma separated)</label>
            <input
              className={inputCls}
              placeholder="S, M, L, XL"
              value={form.sizes}
              onChange={(e) => update("sizes", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Images</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {form.images.map((img, idx) => (
            <ImageUpload
              key={idx}
              value={img}
              onChange={(url) => setImage(idx, url)}
              label={`Image ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Tags</h3>
        <div className="flex flex-wrap gap-4">
          {ALL_TAGS.map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.tags.includes(tag)}
                onChange={() => toggleTag(tag)}
                className="h-4 w-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
        >
          {submitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {submitting ? "Saving…" : productId ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
