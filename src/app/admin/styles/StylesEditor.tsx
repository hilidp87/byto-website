"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type SlotKey = "outfit-1" | "outfit-2" | "outfit-3";

type SlotData = {
  src: string;
  top: { x: string; y: string; width: string; splitY: number };
  bottom: { x: string; y: string; width: string };
};

type Positions = Partial<Record<SlotKey, SlotData>>;

const CANVAS_W = 600;
const CANVAS_H = 1000;

const SLOTS: SlotKey[] = ["outfit-1", "outfit-2", "outfit-3"];

export default function StylesEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Positions persisted on server
  const [positions, setPositions] = useState<Positions>({});
  const [loadingPositions, setLoadingPositions] = useState(true);

  // Active slot
  const [slot, setSlot] = useState<SlotKey>("outfit-1");

  // Garment state (in canvas-px units)
  const [garmentUrl, setGarmentUrl] = useState<string | null>(null);
  const [garmentX, setGarmentX] = useState(CANVAS_W / 2);   // center X
  const [garmentY, setGarmentY] = useState(CANVAS_H * 0.15); // 15% from top
  const [garmentW, setGarmentW] = useState(CANVAS_W * 0.55); // 55% width
  const [splitY, setSplitY] = useState(CANVAS_H * 0.5);     // 50% split

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Drag state refs (avoids stale closures in event handlers)
  const dragRef = useRef<{
    type: "garment" | "split" | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ type: null, startX: 0, startY: 0, origX: 0, origY: 0 });

  // Load saved positions
  useEffect(() => {
    fetch("/api/admin/outfit-positions")
      .then((r) => r.json())
      .then((data: Positions) => {
        setPositions(data);
        setLoadingPositions(false);
      })
      .catch(() => setLoadingPositions(false));
  }, []);

  // When slot changes, load its saved state into editor
  useEffect(() => {
    const s = positions[slot];
    if (s) {
      setGarmentUrl(s.src);
      // Clamp restored values to valid canvas-px ranges to guard against
      // previously-saved bad values (e.g. width > 100%).
      const restoredW = Math.min(CANVAS_W, Math.max(20, parseFloat(s.top.width) / 100 * CANVAS_W));
      const restoredX = Math.min(CANVAS_W, Math.max(0, parseFloat(s.top.x) / 100 * CANVAS_W + restoredW / 2));
      const restoredY = Math.min(CANVAS_H, Math.max(0, parseFloat(s.top.y) / 100 * CANVAS_H));
      setGarmentX(restoredX);
      setGarmentY(restoredY);
      setGarmentW(restoredW);
      setSplitY(s.top.splitY);
    } else {
      setGarmentUrl(null);
      setGarmentX(CANVAS_W / 2);
      setGarmentY(CANVAS_H * 0.15);
      setGarmentW(CANVAS_W * 0.55);
      setSplitY(CANVAS_H * 0.5);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot, loadingPositions]);

  // Convert canvas-px to display-px (canvas is rendered at a scaled size)
  const scale = useCallback(() => {
    if (!canvasRef.current) return 1;
    return canvasRef.current.getBoundingClientRect().width / CANVAS_W;
  }, []);

  // ---- Drag handlers ----
  const onGarmentMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      type: "garment",
      startX: e.clientX,
      startY: e.clientY,
      origX: garmentX,
      origY: garmentY,
    };
  }, [garmentX, garmentY]);

  const onSplitMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      type: "split",
      startX: e.clientX,
      startY: e.clientY,
      origX: 0,
      origY: splitY,
    };
  }, [splitY]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d.type) return;
      const s = scale();
      const dx = (e.clientX - d.startX) / s;
      const dy = (e.clientY - d.startY) / s;

      if (d.type === "garment") {
        setGarmentX(Math.max(0, Math.min(CANVAS_W, d.origX + dx)));
        setGarmentY(Math.max(0, Math.min(CANVAS_H, d.origY + dy)));
      } else if (d.type === "split") {
        setSplitY(Math.max(10, Math.min(CANVAS_H - 10, d.origY + dy)));
      }
    };
    const onMouseUp = () => { dragRef.current.type = null; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [scale]);

  // Double-click to snap garment to horizontal center
  const onGarmentDblClick = useCallback(() => {
    setGarmentX(CANVAS_W / 2);
  }, []);

  // ---- Upload ----
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setGarmentUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  // ---- Save ----
  async function handleSave() {
    if (!canvasRef.current) return;
    setSaving(true);
    setSavedMsg("");

    // Use the actual rendered canvas element size for all calculations.
    const rect = canvasRef.current.getBoundingClientRect();
    const cw = rect.width;   // canvas rendered width in display-px
    const ch = rect.height;  // canvas rendered height in display-px

    // Convert logical canvas-px → display-px → % of canvas.
    // Clamp width to canvas bounds before computing left edge.
    const clampedW = Math.min(cw, Math.max(20 / CANVAS_W * cw, garmentW / CANVAS_W * cw));
    const leftPx   = (garmentX / CANVAS_W * cw) - clampedW / 2;
    const topPx    = garmentY / CANVAS_H * ch;
    const splitPx  = splitY   / CANVAS_H * ch;

    const leftPct  = ((leftPx  / cw) * 100).toFixed(1);
    const topPct   = ((topPx   / ch) * 100).toFixed(1);
    const widthPct = ((clampedW / cw) * 100).toFixed(1);
    const splitPct = ((splitPx / ch) * 100).toFixed(1);

    const updated: Positions = {
      ...positions,
      [slot]: {
        src: garmentUrl ?? "",
        top: {
          x: `${leftPct}%`,
          y: `${topPct}%`,
          width: `${widthPct}%`,
          splitY: Math.round(splitY),
        },
        bottom: {
          x: `${leftPct}%`,
          y: `${splitPct}%`,
          width: `${widthPct}%`,
        },
      },
    };

    try {
      await fetch("/api/admin/outfit-positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setPositions(updated);
      setSavedMsg("Saved!");
    } catch {
      setSavedMsg("Save failed.");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 3000);
    }
  }

  // ---- Derived display values ----
  const s = scale();
  const gLeft  = garmentX - garmentW / 2;  // left edge of garment in canvas-px
  const gRight = garmentX + garmentW / 2;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* ---- Left: Canvas ---- */}
      <div className="flex-1">
        <div
          ref={canvasRef}
          className="relative mx-auto overflow-hidden rounded-xl border border-gray-200 bg-pink-100"
          style={{ aspectRatio: "600/1000", maxWidth: 420, userSelect: "none" }}
        >
          {/* Model base */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/outfits/model.png"
            alt="model"
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />

          {/* Garment overlay */}
          {garmentUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={garmentUrl}
                alt="garment"
                onMouseDown={onGarmentMouseDown}
                onDoubleClick={onGarmentDblClick}
                draggable={false}
                title="Drag to reposition · Double-click to center"
                style={{
                  position: "absolute",
                  left: `${(gLeft / CANVAS_W) * 100}%`,
                  top:  `${(garmentY / CANVAS_H) * 100}%`,
                  width: `${(garmentW / CANVAS_W) * 100}%`,
                  height: "auto",
                  cursor: "grab",
                  zIndex: 10,
                }}
              />

              {/* Split line */}
              <div
                onMouseDown={onSplitMouseDown}
                title="Drag to set top/bottom split"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${(splitY / CANVAS_H) * 100}%`,
                  height: 2,
                  background: "rgba(220,38,38,0.9)",
                  borderTop: "2px dashed #dc2626",
                  cursor: "ns-resize",
                  zIndex: 20,
                }}
              >
                {/* Label */}
                <span
                  style={{
                    position: "absolute",
                    right: 4,
                    top: -18,
                    fontSize: 10,
                    color: "#dc2626",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    background: "white",
                    padding: "1px 4px",
                    borderRadius: 3,
                    whiteSpace: "nowrap",
                  }}
                >
                  SPLIT · {Math.round(splitY)}px
                </span>
              </div>

              {/* Corner scale handles */}
              {[
                { cx: gLeft,  cy: garmentY,         cursor: "nw-resize", corner: "tl" },
                { cx: gRight, cy: garmentY,         cursor: "ne-resize", corner: "tr" },
              ].map(({ cx, cy, cursor, corner }) => (
                <div
                  key={corner}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const startX = e.clientX;
                    const origW = garmentW;
                    const sign = corner === "tr" ? 1 : -1;
                    const onMove = (me: MouseEvent) => {
                      const delta = (me.clientX - startX) / scale() * sign;
                      setGarmentW(Math.max(20, Math.min(CANVAS_W, origW + delta * 2)));
                    };
                    const onUp = () => {
                      window.removeEventListener("mousemove", onMove);
                      window.removeEventListener("mouseup", onUp);
                    };
                    window.addEventListener("mousemove", onMove);
                    window.addEventListener("mouseup", onUp);
                  }}
                  style={{
                    position: "absolute",
                    left: `${(cx / CANVAS_W) * 100}%`,
                    top:  `${(cy / CANVAS_H) * 100}%`,
                    width: 12,
                    height: 12,
                    background: "white",
                    border: "2px solid #2563eb",
                    borderRadius: 2,
                    transform: "translate(-50%, -50%)",
                    cursor,
                    zIndex: 30,
                  }}
                />
              ))}
            </>
          )}

          {/* Upload prompt when empty */}
          {!garmentUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-lg bg-white/70 px-4 py-2 text-sm text-gray-500">
                Upload a garment image →
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Right: Controls ---- */}
      <div className="flex w-full flex-col gap-5 lg:w-72">
        {/* Slot selector */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">
            Outfit Slot
          </label>
          <div className="flex gap-2">
            {SLOTS.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition ${
                  slot === s
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-600 hover:border-gray-500"
                }`}
              >
                {s.replace("outfit-", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">
            Garment Image (PNG, transparent bg)
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 transition hover:border-gray-500 hover:text-gray-700">
            {uploading ? "Uploading…" : "Click to upload"}
            <input
              type="file"
              accept="image/png,image/webp"
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {garmentUrl && (
            <p className="mt-1 truncate text-xs text-gray-400">{garmentUrl}</p>
          )}
        </div>

        {/* Width slider */}
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-gray-500">
            <span>Width</span>
            <span className="font-mono text-gray-700">
              {Math.round((garmentW / CANVAS_W) * 100)}%
            </span>
          </label>
          <input
            type="range"
            min={10}
            max={CANVAS_W}
            value={garmentW}
            onChange={(e) => setGarmentW(Number(e.target.value))}
            className="w-full accent-gray-900"
          />
        </div>

        {/* Position readout */}
        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <p className="mb-1 font-semibold uppercase tracking-widest text-gray-400">
            Position
          </p>
          <p>X: {Math.round((garmentX / CANVAS_W) * 100)}%</p>
          <p>Y (top): {Math.round((garmentY / CANVAS_H) * 100)}%</p>
          <p>Y (split): {Math.round(splitY)}px / {Math.round((splitY / CANVAS_H) * 100)}%</p>
          <p>Y (bottom): {Math.round((splitY / CANVAS_H) * 100)}%</p>
          <p className="mt-1 text-gray-400 italic">
            Double-click garment to snap to center
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !garmentUrl}
          className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save to positions.json"}
        </button>
        {savedMsg && (
          <p className={`text-center text-sm font-medium ${savedMsg.includes("fail") ? "text-red-600" : "text-green-600"}`}>
            {savedMsg}
          </p>
        )}

        {/* JSON preview */}
        {garmentUrl && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Preview Output
            </p>
            <pre className="overflow-auto rounded-lg bg-gray-900 p-3 text-[10px] leading-relaxed text-green-400">
              {JSON.stringify(
                {
                  [slot]: {
                    src: garmentUrl,
                    top: {
                      x: `${((garmentX / CANVAS_W) * 100).toFixed(1)}%`,
                      y: `${((garmentY / CANVAS_H) * 100).toFixed(1)}%`,
                      width: `${((garmentW / CANVAS_W) * 100).toFixed(1)}%`,
                      splitY: Math.round(splitY),
                    },
                    bottom: {
                      x: `${((garmentX / CANVAS_W) * 100).toFixed(1)}%`,
                      y: `${((splitY / CANVAS_H) * 100).toFixed(1)}%`,
                      width: `${((garmentW / CANVAS_W) * 100).toFixed(1)}%`,
                    },
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
