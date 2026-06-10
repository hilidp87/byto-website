"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLookPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/looks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ذخیره ناموفق بود");
      router.push(`/admin/looks/${data.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
      setSaving(false);
    }
  }

  return (
    <div dir="rtl" className="max-w-2xl space-y-6 text-right">
      <h1 className="text-2xl font-semibold text-gray-900">افزودن لوک جدید</h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">عنوان</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">توضیحات</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">آدرس تصویر</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            dir="ltr"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>

        {image && (
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">پیش‌نمایش</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="پیش‌نمایش"
              className="max-h-64 rounded-lg border border-gray-200 object-cover"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
        >
          {saving ? "در حال ذخیره…" : "ذخیره و افزودن هات‌اسپات"}
        </button>
      </form>
    </div>
  );
}
