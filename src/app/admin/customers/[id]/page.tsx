"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";

type CustomerDetail = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  orders: {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    itemsCount: number;
  }[];
};

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/customers/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load customer");
        return r.json();
      })
      .then(setCustomer)
      .catch((e) => setError(e.message));
  }, [params.id]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="text-sm text-gray-500 hover:text-sky-600"
        >
          ← Back to customers
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Customer</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!customer && !error ? (
        <div className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white" />
      ) : customer ? (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-xl font-semibold text-sky-700">
                {(customer.name || customer.email).charAt(0).toUpperCase()}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {customer.name || "—"}
                </h2>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {customer.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Joined</p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Total Orders
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {customer.totalOrders}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Total Spent
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  ${customer.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Order History</h2>
            </div>
            {customer.orders.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Order ID</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Items</th>
                      <th className="px-5 py-3">Total</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customer.orders.map((o, i) => (
                      <tr key={o.id} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
                        <td className="px-5 py-3 font-mono text-xs text-gray-700">
                          #{o.id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-gray-600">{o.itemsCount}</td>
                        <td className="px-5 py-3 font-medium text-gray-900">
                          ${o.total.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
