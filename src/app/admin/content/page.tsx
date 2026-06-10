"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import ImageUpload from "@/components/admin/ImageUpload";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  position: number;
  active: boolean;
};

type Section = {
  id: string;
  type: string;
  label: string;
  position: number;
  active: boolean;
};

const emptyBanner = {
  title: "",
  subtitle: "",
  image: "",
  link: "",
  active: true,
};

export default function ContentPage() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [sections, setSections] = useState<Section[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // banner form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyBanner });
  const [savingBanner, setSavingBanner] = useState(false);

  // section reorder
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);

  function load() {
    fetch("/api/admin/content/banners")
      .then((r) => {
        if (!r.ok) throw new Error("بارگذاری بنرها ناموفق بود");
        return r.json();
      })
      .then(setBanners)
      .catch((e) => setError(e.message));
    fetch("/api/admin/content/sections")
      .then((r) => {
        if (!r.ok) throw new Error("بارگذاری بخش‌ها ناموفق بود");
        return r.json();
      })
      .then(setSections)
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function openNew() {
    setEditId(null);
    setForm({ ...emptyBanner });
    setShowForm(true);
  }

  function openEdit(b: Banner) {
    setEditId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      image: b.image,
      link: b.link || "",
      active: b.active,
    });
    setShowForm(true);
  }

  async function saveBanner(e: React.FormEvent) {
    e.preventDefault();
    setSavingBanner(true);
    setError(null);
    try {
      const url = editId
        ? `/api/admin/content/banners/${editId}`
        : "/api/admin/content/banners";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "ذخیره ناموفق بود");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setSavingBanner(false);
    }
  }

  async function deleteBanner(id: string) {
    const res = await fetch(`/api/admin/content/banners/${id}`, { method: "DELETE" });
    if (res.ok) setBanners((prev) => prev?.filter((b) => b.id !== id) ?? null);
  }

  async function moveBanner(index: number, dir: -1 | 1) {
    if (!banners) return;
    const target = index + dir;
    if (target < 0 || target >= banners.length) return;
    const a = banners[index];
    const b = banners[target];
    await Promise.all([
      fetch(`/api/admin/content/banners/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: b.position }),
      }),
      fetch(`/api/admin/content/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: a.position }),
      }),
    ]);
    load();
  }

  async function toggleSection(s: Section) {
    const res = await fetch(`/api/admin/content/sections/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    if (res.ok) {
      setSections(
        (prev) =>
          prev?.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)) ?? null
      );
    }
  }

  function onDrop(index: number) {
    if (dragIndex === null || dragIndex === index || !sections) {
      setDragIndex(null);
      return;
    }
    const next = [...sections];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setSections(next.map((s, i) => ({ ...s, position: i })));
    setDragIndex(null);
    setOrderSaved(false);
  }

  async function saveOrder() {
    if (!sections) return;
    setSavingOrder(true);
    setOrderSaved(false);
    try {
      const res = await fetch("/api/admin/content/sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((s, i) => ({ id: s.id, position: i })),
        }),
      });
      if (res.ok) setOrderSaved(true);
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div dir="rtl" className="space-y-10 text-right">
      <h1 className="text-2xl font-semibold text-gray-900">مدیریت محتوا</h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ===== BANNERS ===== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">بنرها</h2>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            <PlusIcon className="h-4 w-4" />
            افزودن بنر
          </button>
        </div>

        {!banners ? (
          <div className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white" />
        ) : banners.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            هنوز بنری ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">تصویر</th>
                    <th className="px-4 py-3">عنوان</th>
                    <th className="px-4 py-3">زیرعنوان</th>
                    <th className="px-4 py-3">لینک</th>
                    <th className="px-4 py-3">موقعیت</th>
                    <th className="px-4 py-3">وضعیت</th>
                    <th className="px-4 py-3 text-left">اقدام‌ها</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {banners.map((b, i) => (
                    <tr key={b.id} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
                      <td className="px-4 py-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.image || "https://via.placeholder.com/60"}
                          alt={b.title}
                          className="h-10 w-16 rounded object-cover"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{b.title}</td>
                      <td className="px-4 py-3 text-gray-600">{b.subtitle || "—"}</td>
                      <td className="px-4 py-3 text-gray-500" dir="ltr">
                        {b.link || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{b.position}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            b.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {b.active ? "فعال" : "غیرفعال"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-start gap-1">
                          <button
                            onClick={() => moveBanner(i, -1)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                            title="بالا"
                          >
                            <ArrowUpIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveBanner(i, 1)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                            title="پایین"
                          >
                            <ArrowDownIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEdit(b)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-sky-600"
                            title="ویرایش"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteBanner(b.id)}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-500"
                            title="حذف"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ===== SECTION ORDER ===== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            ترتیب بخش‌های صفحه اصلی
          </h2>
          <button
            onClick={saveOrder}
            disabled={savingOrder}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {savingOrder ? "در حال ذخیره…" : "ذخیره ترتیب"}
          </button>
        </div>
        {orderSaved && <p className="text-sm text-green-600">ترتیب ذخیره شد</p>}

        {!sections ? (
          <div className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white" />
        ) : (
          <ul className="space-y-2">
            {sections.map((s, i) => (
              <li
                key={s.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Bars3Icon className="h-5 w-5 cursor-grab text-gray-400" />
                  <span className="font-medium text-gray-800">{s.label}</span>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={s.active}
                    onChange={() => toggleSection(s)}
                    className="h-4 w-4"
                  />
                  فعال
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ===== BANNER FORM MODAL ===== */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowForm(false)}
        >
          <form
            dir="rtl"
            onSubmit={saveBanner}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 text-right shadow-xl"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {editId ? "ویرایش بنر" : "افزودن بنر"}
            </h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">عنوان</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">زیرعنوان</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <ImageUpload
              label="تصویر بنر"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">لینک</label>
              <input
                type="text"
                dir="ltr"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4"
              />
              فعال
            </label>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={savingBanner}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
              >
                {savingBanner ? "در حال ذخیره…" : "ذخیره"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
