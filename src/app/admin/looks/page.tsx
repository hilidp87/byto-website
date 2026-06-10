"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

type AdminLook = {
  id: string;
  title: string;
  image: string;
  active: boolean;
  totalClicks: number;
  _count: { hotspots: number };
};

export default function AdminLooksPage() {
  const [looks, setLooks] = useState<AdminLook[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/looks")
      .then((r) => {
        if (!r.ok) throw new Error("بارگذاری لوک‌ها ناموفق بود");
        return r.json();
      })
      .then(setLooks)
      .catch((e) => setError(e.message));
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/looks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLooks((prev) => prev?.filter((l) => l.id !== id) ?? null);
      }
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">لوک‌ها</h1>
        <Link
          href="/admin/looks/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
        >
          <PlusIcon className="h-4 w-4" />
          افزودن لوک جدید
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!looks && !error ? (
        <div className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white" />
      ) : looks && looks.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          هنوز لوکی ثبت نشده است.
        </div>
      ) : looks ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">تصویر</th>
                  <th className="px-4 py-3">عنوان</th>
                  <th className="px-4 py-3">تعداد هات‌اسپات</th>
                  <th className="px-4 py-3">کلیک‌ها</th>
                  <th className="px-4 py-3">وضعیت</th>
                  <th className="px-4 py-3 text-left">اقدام‌ها</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {looks.map((l, i) => (
                  <tr key={l.id} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
                    <td className="px-4 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={l.image || "https://via.placeholder.com/60"}
                        alt={l.title}
                        className="h-[60px] w-[60px] rounded-md object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{l.title}</td>
                    <td className="px-4 py-3 text-gray-600">{l._count.hotspots}</td>
                    <td className="px-4 py-3 text-gray-600">{l.totalClicks}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          l.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {l.active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-start gap-2">
                        <Link
                          href={`/admin/looks/${l.id}/edit`}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-sky-600"
                          title="ویرایش"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                        {confirmId === l.id ? (
                          <span className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(l.id)}
                              disabled={deletingId === l.id}
                              className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-60"
                            >
                              {deletingId === l.id ? "…" : "تأیید"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                            >
                              انصراف
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmId(l.id)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-500"
                            title="حذف"
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
      ) : null}
    </div>
  );
}
