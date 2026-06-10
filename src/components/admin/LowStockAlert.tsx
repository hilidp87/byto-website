import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type Product = { id: string; title: string; stock: number };

export default function LowStockAlert({ products }: { products: Product[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
        <h2 className="text-sm font-semibold text-gray-900">Low Stock Products</h2>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-gray-500">All products are well stocked.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2">
              <Link
                href={`/admin/products/${p.id}/edit`}
                className="text-sm text-gray-800 hover:text-sky-600"
              >
                {p.title}
              </Link>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {p.stock} left
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
