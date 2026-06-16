"use client";

import { useState } from "react";

type Props = {
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
};

export function GarmentUploader({ label, currentUrl, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onUploaded(data.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition hover:border-gray-500 hover:text-gray-700">
        {uploading ? "Uploading…" : currentUrl ? "Replace image" : "Upload PNG"}
        <input
          type="file"
          accept="image/png,image/webp"
          className="sr-only"
          onChange={handleChange}
          disabled={uploading}
        />
      </label>
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt={label}
          className="mx-auto max-h-24 max-w-full rounded border border-gray-200 object-contain"
        />
      )}
    </div>
  );
}
