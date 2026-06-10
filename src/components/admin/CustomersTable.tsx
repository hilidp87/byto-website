"use client";

import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";

export type AdminCustomer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
};

function initial(name: string | null, email: string) {
  const src = name?.trim() || email;
  return src.charAt(0).toUpperCase();
}

export default function CustomersTable({
  customers,
}: {
  customers: AdminCustomer[];
}) {
  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        No customers yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spent</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c, i) => (
              <tr key={c.id} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                      {initial(c.name, c.email)}
                    </span>
                    <span className="font-medium text-gray-900">
                      {c.name || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{c.email}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-gray-700">{c.totalOrders}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  ${c.totalSpent.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
