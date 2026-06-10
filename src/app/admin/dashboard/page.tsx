"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import StatsCard from "@/components/admin/StatsCard";
import RevenueChart from "@/components/admin/RevenueChart";
import LowStockAlert from "@/components/admin/LowStockAlert";
import StatusBadge from "@/components/admin/StatusBadge";

type Stats = {
  ordersToday: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  recentOrders: {
    id: string;
    email: string;
    total: number;
    status: string;
    itemsCount: number;
    createdAt: string;
  }[];
  lowStockProducts: { id: string; title: string; stock: number }[];
  revenueChart: { date: string; revenue: number }[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load dashboard");
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Orders Today"
          value={stats.ordersToday}
          icon={<ShoppingBagIcon className="h-5 w-5" />}
        />
        <StatsCard
          label="Revenue Today"
          value={`$${stats.revenueToday.toFixed(2)}`}
          icon={<CurrencyDollarIcon className="h-5 w-5" />}
          accent="text-green-500"
        />
        <StatsCard
          label="Revenue This Week"
          value={`$${stats.revenueWeek.toFixed(2)}`}
          icon={<CalendarDaysIcon className="h-5 w-5" />}
        />
        <StatsCard
          label="Revenue This Month"
          value={`$${stats.revenueMonth.toFixed(2)}`}
          icon={<ChartBarIcon className="h-5 w-5" />}
        />
      </div>

      <RevenueChart data={stats.revenueChart} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No recent orders.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Total</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.recentOrders.map((o, i) => (
                      <tr key={o.id} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
                        <td className="px-5 py-3 font-mono text-xs text-gray-700">
                          #{o.id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-3 text-gray-700">{o.email}</td>
                        <td className="px-5 py-3 font-medium text-gray-900">
                          ${o.total.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="border-t border-gray-100 px-5 py-3 text-right">
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                View all orders →
              </Link>
            </div>
          </div>
        </div>

        <LowStockAlert products={stats.lowStockProducts} />
      </div>
    </div>
  );
}
