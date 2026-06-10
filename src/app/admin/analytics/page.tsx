"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Analytics = {
  revenueChart: { date: string; revenue: number }[];
  topProducts: {
    id: string;
    title: string;
    category: string;
    sold: number;
    revenue: number;
    images: string[];
  }[];
  bestLooks: {
    id: string;
    title: string;
    image: string;
    clicks: number;
    conversions: number;
    conversionRate: number;
  }[];
  customerGrowth: { month: string; count: number }[];
  mostViewed: {
    id: string;
    title: string;
    slug: string;
    category: string;
    views: number;
    images: string[];
  }[];
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {children}
    </section>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => {
        if (!r.ok) throw new Error("بارگذاری آمار ناموفق بود");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div dir="rtl" className="text-right">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div dir="rtl" className="space-y-6 text-right">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-72 animate-pulse rounded-xl border border-gray-200 bg-white" />
        <div className="h-72 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    );
  }

  const revenue = data.revenueChart.map((d) => ({ ...d, label: d.date.slice(5) }));
  const topBar = data.topProducts.map((p) => ({
    label: p.title.length > 12 ? p.title.slice(0, 12) + "…" : p.title,
    sold: p.sold,
  }));

  return (
    <div dir="rtl" className="space-y-8 text-right">
      <h1 className="text-2xl font-semibold text-gray-900">آمار و تحلیل</h1>

      {/* Revenue trends */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">روند درآمد (۹۰ روز اخیر)</h2>
        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickFormatter={(v) => `$${v}`}
                width={56}
              />
              <Tooltip
                formatter={(v) => [`$${Number(v).toFixed(2)}`, "درآمد"]}
                labelFormatter={(l) => `تاریخ: ${l}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top selling products */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">محصولات پرفروش</h2>
        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topBar} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} width={40} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, "تعداد فروش"]} />
              <Bar dataKey="sold" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-right text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">تصویر</th>
                <th className="px-4 py-2">نام</th>
                <th className="px-4 py-2">دسته‌بندی</th>
                <th className="px-4 py-2">تعداد فروش</th>
                <th className="px-4 py-2">درآمد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.topProducts.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/40"}
                      alt={p.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900">{p.title}</td>
                  <td className="px-4 py-2 text-gray-600">{p.category}</td>
                  <td className="px-4 py-2 text-gray-700">{p.sold}</td>
                  <td className="px-4 py-2 text-gray-700">${p.revenue.toFixed(2)}</td>
                </tr>
              ))}
              {data.topProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                    داده‌ای موجود نیست.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Best performing looks */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">لوک‌های پربازده</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-right text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">عنوان لوک</th>
                <th className="px-4 py-2">تعداد کلیک</th>
                <th className="px-4 py-2">تعداد تبدیل</th>
                <th className="px-4 py-2">نرخ تبدیل (٪)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.bestLooks.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{l.title}</td>
                  <td className="px-4 py-2 text-gray-700">{l.clicks}</td>
                  <td className="px-4 py-2 text-gray-700">{l.conversions}</td>
                  <td className="px-4 py-2 text-gray-700">{l.conversionRate}</td>
                </tr>
              ))}
              {data.bestLooks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                    داده‌ای موجود نیست.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer growth */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">رشد مشتریان (۱۲ ماه اخیر)</h2>
        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.customerGrowth}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} width={40} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, "مشتری جدید"]} />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Most viewed products */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">محصولات پربازدید</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-right text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">نام</th>
                <th className="px-4 py-2">دسته‌بندی</th>
                <th className="px-4 py-2">تعداد بازدید</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.mostViewed.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-medium">
                    <Link
                      href={`/products/${p.slug}`}
                      className="text-sky-600 hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.category}</td>
                  <td className="px-4 py-2 text-gray-700">{p.views}</td>
                </tr>
              ))}
              {data.mostViewed.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-400">
                    داده‌ای موجود نیست.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
