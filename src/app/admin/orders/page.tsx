"use client";

import { useEffect, useState } from "react";
import OrdersTable, { AdminOrder } from "@/components/admin/OrdersTable";

const STATUS_FILTERS = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setOrders(null);
    setError(null);
    const qs = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/admin/orders${qs}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load orders");
        return r.json();
      })
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm capitalize text-gray-700 focus:border-sky-500 focus:outline-none sm:w-48"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!orders && !error ? (
        <div className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white" />
      ) : orders ? (
        <OrdersTable
          orders={orders}
          onStatusChange={(id, status) =>
            setOrders((prev) =>
              prev?.map((o) => (o.id === id ? { ...o, status } : o)) ?? null
            )
          }
        />
      ) : null}
    </div>
  );
}
