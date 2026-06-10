"use client";

import { useRef, useState } from "react";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
};

export default function ImageUpload({ value, onChange, label, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "آپلود ناموفق بود");
      onChange(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "خطا در آپلود");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      )}

      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="max-h-48 rounded-lg border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600"
            title="حذف تصویر"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-2 flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            <ArrowUpTrayIcon className="h-3.5 w-3.5" />
            {uploading ? "در حال آپلود…" : "تغییر تصویر"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-500 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-60"
        >
          {uploading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          ) : (
            <ArrowUpTrayIcon className="h-6 w-6" />
          )}
          {uploading ? "در حال آپلود…" : "کلیک کنید یا فایل را اینجا بکشید"}
          <span className="text-xs text-gray-400">JPG، PNG، WebP — حداکثر ۱۰ مگابایت</span>
        </button>
      )}

      {uploadError && (
        <p className="mt-1 text-xs text-red-500">{uploadError}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
