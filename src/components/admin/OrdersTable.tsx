"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export type AdminOrder = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: { email: string | null } | null;
  items: { id: string }[];
};

export default function OrdersTable({
  orders,
  onStatusChange,
}: {
  orders: AdminOrder[];
  onStatusChange: (id: string, status: string) => void;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function changeStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) onStatusChange(id, status);
    } finally {
      setUpdatingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        No orders found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o, i) => (
              <tr key={o.id} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">
                  #{o.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-gray-700">{o.user?.email ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{o.items.length}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  ${o.total.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    disabled={updatingId === o.id}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs capitalize text-gray-700 focus:border-sky-500 focus:outline-none disabled:opacity-60"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
