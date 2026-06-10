"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";

type Product = { id: string; title: string; images: string[] };
type Hotspot = {
  id: string;
  x: number;
  y: number;
  label: string | null;
  productId: string;
  product: Product;
};
type Look = {
  id: string;
  title: string;
  description: string | null;
  image: string;
  active: boolean;
  hotspots: Hotspot[];
};

export default function EditLookPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [look, setLook] = useState<Look | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [active, setActive] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [pendingLabel, setPendingLabel] = useState("");
  const [addingHotspot, setAddingHotspot] = useState(false);

  const imgRef = useRef<HTMLDivElement>(null);

  // drag state (refs to avoid stale closures)
  const draggingId = useRef<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/looks/${id}`).then((r) => {
        if (!r.ok) throw new Error("بارگذاری لوک ناموفق بود");
        return r.json();
      }),
      fetch("/api/admin/products").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([l, p]) => {
        setLook(l);
        setTitle(l.title);
        setDescription(l.description || "");
        setImage(l.image);
        setActive(l.active);
        setProducts(p);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function saveForm(e: React.FormEvent) {
    e.preventDefault();
    setSavingForm(true);
    setError(null);
    setSavedMsg(false);
    try {
      const res = await fetch(`/api/admin/looks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, image, active }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "ذخیره ناموفق بود");
      }
      setSavedMsg(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setSavingForm(false);
    }
  }

  function handleImageClick(e: React.MouseEvent) {
    if (didDrag.current) return; // don't open picker after a drag
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPending({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    setSelectedProduct("");
    setPendingLabel("");
    setSearch("");
  }

  const handleHotspotMouseDown = useCallback(
    (e: React.MouseEvent, hotspotId: string) => {
      e.stopPropagation();
      e.preventDefault();
      draggingId.current = hotspotId;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      didDrag.current = false;
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingId.current || !imgRef.current) return;
      const dx = Math.abs(e.clientX - (dragStartPos.current?.x ?? e.clientX));
      const dy = Math.abs(e.clientY - (dragStartPos.current?.y ?? e.clientY));
      if (dx > 3 || dy > 3) didDrag.current = true;
      if (!didDrag.current) return;

      const rect = imgRef.current.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

      setLook((prev) =>
        prev
          ? {
              ...prev,
              hotspots: prev.hotspots.map((h) =>
                h.id === draggingId.current
                  ? { ...h, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
                  : h
              ),
            }
          : prev
      );
    },
    []
  );

  const handleMouseUp = useCallback(async () => {
    if (!draggingId.current || !didDrag.current) {
      draggingId.current = null;
      return;
    }
    const hId = draggingId.current;
    draggingId.current = null;

    const hotspot = look?.hotspots.find((h) => h.id === hId);
    if (!hotspot) return;

    await fetch(`/api/admin/looks/${id}/hotspots/${hId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x: hotspot.x, y: hotspot.y }),
    });
  }, [look, id]);

  async function addHotspot() {
    if (!pending || !selectedProduct) return;
    setAddingHotspot(true);
    try {
      const res = await fetch(`/api/admin/looks/${id}/hotspots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          x: pending.x,
          y: pending.y,
          label: pendingLabel || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "افزودن ناموفق بود");
      setLook((prev) =>
        prev ? { ...prev, hotspots: [...prev.hotspots, data] } : prev
      );
      setPending(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setAddingHotspot(false);
    }
  }

  async function removeHotspot(hotspotId: string) {
    const res = await fetch(`/api/admin/looks/${id}/hotspots/${hotspotId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setLook((prev) =>
        prev
          ? { ...prev, hotspots: prev.hotspots.filter((h) => h.id !== hotspotId) }
          : prev
      );
    }
  }

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (error && !look) {
    return (
      <div dir="rtl" className="text-right">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!look) {
    return (
      <div dir="rtl" className="grid gap-6 text-right lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-white" />
        <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <h1 className="text-2xl font-semibold text-gray-900">ویرایش لوک</h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: form */}
        <form
          onSubmit={saveForm}
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
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4"
            />
            فعال
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingForm}
              className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
            >
              {savingForm ? "در حال ذخیره…" : "ذخیره تغییرات"}
            </button>
            {savedMsg && <span className="text-sm text-green-600">ذخیره شد</span>}
          </div>
        </form>

        {/* RIGHT: hotspot editor */}
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">
            برای افزودن هات‌اسپات روی تصویر کلیک کنید. برای جابجایی، هات‌اسپات را بکشید.
          </p>
          {image ? (
            <div
              ref={imgRef}
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative w-full cursor-crosshair overflow-hidden rounded-lg border border-gray-200 select-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={title} className="w-full select-none" draggable={false} />

              {look.hotspots.map((h) => (
                <div
                  key={h.id}
                  className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  onMouseDown={(e) => handleHotspotMouseDown(e, h.id)}
                >
                  <span className="relative flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-sky-500 ring-2 ring-white" />
                  </span>
                  <div className="pointer-events-none absolute bottom-5 right-1/2 hidden translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                    {h.product?.title}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHotspot(h.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute -top-2 right-3 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block"
                    title="حذف"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {pending && (
                <div
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pending.x}%`, top: `${pending.y}%` }}
                >
                  <span className="block h-4 w-4 rounded-full bg-amber-500 ring-2 ring-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
              ابتدا آدرس تصویر را وارد و ذخیره کنید.
            </div>
          )}

          {look.hotspots.length > 0 && (
            <ul className="space-y-1 pt-2">
              {look.hotspots.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="text-gray-700">{h.product?.title}</span>
                  <button
                    onClick={() => removeHotspot(h.id)}
                    className="text-red-400 hover:text-red-600"
                    title="حذف"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* hotspot product picker modal */}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPending(null)}
        >
          <div
            dir="rtl"
            className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 text-right shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900">پیوند محصول به هات‌اسپات</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">جستجوی محصول</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="نام محصول…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200">
              {filteredProducts.length === 0 ? (
                <p className="p-3 text-sm text-gray-400">محصولی یافت نشد.</p>
              ) : (
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-right text-sm hover:bg-gray-50 ${
                      selectedProduct === p.id ? "bg-sky-50 text-sky-700" : "text-gray-700"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/32"}
                      alt={p.title}
                      className="h-8 w-8 rounded object-cover"
                    />
                    {p.title}
                  </button>
                ))
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                برچسب (اختیاری)
              </label>
              <input
                type="text"
                value={pendingLabel}
                onChange={(e) => setPendingLabel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPending(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={addHotspot}
                disabled={!selectedProduct || addingHotspot}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
              >
                {addingHotspot ? "در حال افزودن…" : "افزودن هات‌اسپات"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
