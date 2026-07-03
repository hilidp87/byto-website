"use client";

import { useState, useEffect, useCallback } from "react";
import type { OutfitConfig } from "@/types";
import { GarmentUploader } from "./GarmentUploader";
import { AlignmentCanvas, type GarmentState, CANVAS_W, CANVAS_H } from "./AlignmentCanvas";
import { AnimationPreview } from "./AnimationPreview";

const SLOT_COUNT = 10;
const SLOTS = Array.from({ length: SLOT_COUNT }, (_, i) => `slot-${i + 1}`);
type SlotId = string;

const SLOT_LABELS: Record<SlotId, string> = Object.fromEntries(
  SLOTS.map((s, i) => [s, `Look ${i + 1}`])
);

// Deterministic ordering: slot-1 → 1, slot-2 → 2, … slot-10 → 10.
// The frontend already renders outfits ordered by sortOrder ASC.
function slotSortOrder(slotId: SlotId): number {
  const n = Number(slotId.replace("slot-", ""));
  return Number.isFinite(n) ? n : 0;
}

const DEFAULT_CONFIG: Omit<OutfitConfig, "id" | "updatedAt"> = {
  slotId: "slot-1",
  title: "",
  subtitle: "",
  href: "/looks",
  shirtSrc: "",
  shirtX: 300,
  shirtY: 280,
  shirtWidth: 300,
  shirtRotation: 0,
  pantsSrc: "",
  pantsX: 300,
  pantsY: 650,
  pantsWidth: 330,
  pantsRotation: 0,
  active: true,
  sortOrder: 0,
};

function configToGarments(c: OutfitConfig | undefined): { shirt: GarmentState; pants: GarmentState } {
  return {
    shirt: {
      src: c?.shirtSrc ?? "",
      x: c?.shirtX ?? DEFAULT_CONFIG.shirtX,
      y: c?.shirtY ?? DEFAULT_CONFIG.shirtY,
      width: c?.shirtWidth ?? DEFAULT_CONFIG.shirtWidth,
      rotation: c?.shirtRotation ?? 0,
    },
    pants: {
      src: c?.pantsSrc ?? "",
      x: c?.pantsX ?? DEFAULT_CONFIG.pantsX,
      y: c?.pantsY ?? DEFAULT_CONFIG.pantsY,
      width: c?.pantsWidth ?? DEFAULT_CONFIG.pantsWidth,
      rotation: c?.pantsRotation ?? 0,
    },
  };
}

export default function AdminEditor() {
  const [configs, setConfigs] = useState<OutfitConfig[]>([]);
  const [activeSlot, setActiveSlot] = useState<SlotId>("slot-1");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Per-slot local edits (unsaved)
  const [localEdits, setLocalEdits] = useState<Record<string, Partial<OutfitConfig>>>({});

  useEffect(() => {
    fetch("/api/admin/outfit-config")
      .then((r) => r.json())
      .then((data: OutfitConfig[]) => setConfigs(Array.isArray(data) ? data : []))
      .catch(() => setConfigs([]));
  }, []);

  const activeConfig = configs.find((c) => c.slotId === activeSlot);
  const merged: OutfitConfig = {
    ...(DEFAULT_CONFIG as OutfitConfig),
    id: activeConfig?.id ?? "",
    updatedAt: activeConfig?.updatedAt ?? new Date().toISOString(),
    ...activeConfig,
    slotId: activeSlot,
    ...localEdits[activeSlot],
    sortOrder: slotSortOrder(activeSlot),
  };

  const { shirt, pants } = configToGarments(merged);

  function updateLocal(patch: Partial<OutfitConfig>) {
    setLocalEdits((prev) => ({
      ...prev,
      [activeSlot]: { ...prev[activeSlot], ...patch },
    }));
  }

  const onShirtChange = useCallback((g: GarmentState) => {
    updateLocal({ shirtSrc: g.src, shirtX: g.x, shirtY: g.y, shirtWidth: g.width, shirtRotation: g.rotation });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot]);

  const onPantsChange = useCallback((g: GarmentState) => {
    updateLocal({ pantsSrc: g.src, pantsX: g.x, pantsY: g.y, pantsWidth: g.width, pantsRotation: g.rotation });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot]);

  async function handleSave() {
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/admin/outfit-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      const data = await res.json();
      if (data.ok && data.data) {
        setConfigs((prev) => {
          const idx = prev.findIndex((c) => c.slotId === activeSlot);
          const next = [...prev];
          if (idx >= 0) next[idx] = data.data;
          else next.push(data.data);
          return next;
        });
        setLocalEdits((prev) => { const n = { ...prev }; delete n[activeSlot]; return n; });
        setSavedMsg("Saved ✓");
      } else {
        setSavedMsg("Save failed");
      }
    } catch {
      setSavedMsg("Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 5000);
    }
  }

  const isDirty = Boolean(localEdits[activeSlot] && Object.keys(localEdits[activeSlot]).length > 0);

  return (
    <div className="space-y-6">
      {/* Slot tabs */}
      <div className="flex flex-wrap gap-2">
        {SLOTS.map((s) => {
          const hasEdits = Boolean(localEdits[s] && Object.keys(localEdits[s]).length > 0);
          return (
            <button
              key={s}
              onClick={() => setActiveSlot(s)}
              className={`flex-1 min-w-[80px] rounded-lg border py-2 text-sm font-semibold transition ${
                activeSlot === s
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 text-gray-600 hover:border-gray-500"
              }`}
            >
              {SLOT_LABELS[s]}
              {hasEdits && <span className="ml-1 text-amber-400">•</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-8 xl:flex-row">
        {/* ── Left: Canvas ── */}
        <div className="flex-1">
          <AlignmentCanvas
            shirt={shirt}
            pants={pants}
            onShirtChange={onShirtChange}
            onPantsChange={onPantsChange}
          />
        </div>

        {/* ── Right: Controls ── */}
        <div className="flex w-full flex-col gap-6 xl:w-80">
          {/* Metadata */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Look Details</p>
            <input
              type="text"
              placeholder="Title (e.g. Campus Cool)"
              value={merged.title}
              onChange={(e) => updateLocal({ title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Subtitle (e.g. White cardigan · crop tank)"
              value={merged.subtitle}
              onChange={(e) => updateLocal({ subtitle: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Link href (e.g. /looks)"
              value={merged.href}
              onChange={(e) => updateLocal({ href: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>

          {/* Garment uploaders */}
          <GarmentUploader
            label="Upper Garment (shirt / top)"
            currentUrl={shirt.src}
            onUploaded={(url) => onShirtChange({ ...shirt, src: url })}
          />
          <GarmentUploader
            label="Lower Garment (pants / skirt)"
            currentUrl={pants.src}
            onUploaded={(url) => onPantsChange({ ...pants, src: url })}
          />

          {/* Position readout */}
          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            <p className="mb-2 font-semibold uppercase tracking-widest text-gray-400">Transform Values</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="font-medium text-gray-500">Shirt X</p>
              <p>{Math.round((shirt.x / CANVAS_W) * 100)}%</p>
              <p className="font-medium text-gray-500">Shirt Y</p>
              <p>{Math.round((shirt.y / CANVAS_H) * 100)}%</p>
              <p className="font-medium text-gray-500">Shirt W</p>
              <p>{Math.round((shirt.width / CANVAS_W) * 100)}%</p>
              <p className="font-medium text-gray-500">Shirt °</p>
              <p>{shirt.rotation.toFixed(1)}°</p>
              <p className="font-medium text-gray-500 pt-1">Pants X</p>
              <p className="pt-1">{Math.round((pants.x / CANVAS_W) * 100)}%</p>
              <p className="font-medium text-gray-500">Pants Y</p>
              <p>{Math.round((pants.y / CANVAS_H) * 100)}%</p>
              <p className="font-medium text-gray-500">Pants W</p>
              <p>{Math.round((pants.width / CANVAS_W) * 100)}%</p>
              <p className="font-medium text-gray-500">Pants °</p>
              <p>{pants.rotation.toFixed(1)}°</p>
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3">
            <span className="text-sm font-medium text-gray-700">Show on website</span>
            <input
              type="checkbox"
              checked={merged.active}
              onChange={(e) => updateLocal({ active: e.target.checked })}
              className="h-4 w-4 accent-gray-900"
            />
          </label>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-40 ${
              isDirty ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-900 hover:bg-gray-700"
            }`}
          >
            {saving ? "Saving…" : isDirty ? "Save changes ●" : "Save"}
          </button>
          {savedMsg && (
            <p className={`text-center text-sm font-medium ${savedMsg.includes("fail") ? "text-red-600" : "text-green-600"}`}>
              {savedMsg}
            </p>
          )}
        </div>
      </div>

      {/* ── Animation Preview ── */}
      <div className="border-t border-gray-100 pt-6">
        <AnimationPreview shirt={shirt} pants={pants} />
      </div>
    </div>
  );
}
