"use client";

import Link from "next/link";
import { useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import TagBadge from "./TagBadge";

export type AdminProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  tags: string[];
};

export default function ProductsTable({
  products,
  onDeleted,
}: {
  products: AdminProduct[];
  onDeleted: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(id);
      }
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        No products yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Compare</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p, i) => (
              <tr key={p.id} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
                <td className="px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/40"}
                    alt={p.title}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                <td className="px-4 py-3 text-gray-600">{p.category}</td>
                <td className="px-4 py-3 text-gray-900">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {p.comparePrice != null ? `$${p.comparePrice.toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.stock < 10 ? "font-semibold text-red-500" : "text-gray-700"
                    }
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.tags?.map((t) => <TagBadge key={t} tag={t} />)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-sky-600"
                      title="Edit"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </Link>
                    {confirmId === p.id ? (
                      <span className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-60"
                        >
                          {deletingId === p.id ? "…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(p.id)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-500"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
