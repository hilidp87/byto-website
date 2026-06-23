"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  animate,
  type MotionValue,
} from "framer-motion";
import type { OutfitConfig } from "@/types";

/**
 * COORDINATE SYSTEM — must match AlignmentCanvas.tsx exactly:
 *
 *   Virtual canvas : CANVAS_W × CANVAS_H  (600 × 1000)
 *   Model box CSS  : width = min(100vw, calc(100vh * 3/5))
 *                    aspect-ratio = 3/5
 *                    position = absolute, centered in the sticky container
 *
 * Garment worn position:
 *   left_px  = boxLeft + (cx / CANVAS_W) * boxWidth  − garmentWidth / 2
 *   top_px   = boxTop  + (cy / CANVAS_H) * boxHeight − garmentHeight / 2
 *
 * Garment resting position:
 *   Shirts  → upper area, horizontally distributed by slot offset
 *   Pants   → lower area, same horizontal distribution
 *   Never off-screen, never faded — always present in the scene
 *
 * NAVIGATION
 *   Outfit switching is driven ONLY by horizontal gestures (wheel deltaX,
 *   horizontal trackpad, pointer drag, touch swipe). Vertical page scroll
 *   is never intercepted and never changes the active outfit. Each gesture
 *   snaps to the nearest whole outfit index and animates there with an
 *   eased spring — no scroll-position dependency, no "stop precisely here".
 */

const CANVAS_W = 600;
const CANVAS_H = 1000;

// Horizontal distance between outfit slots (fraction of viewport width)
const SLOT_VW = 0.36;

// Resting shirt — upper portion of the viewport, centered in its slot
const REST_SHIRT_Y_VH = 0.27; // vertical center as fraction of vh
const REST_SHIRT_W_VW = 0.12; // width as fraction of vw

// Resting pants — lower portion
const REST_PANTS_Y_VH = 0.66;
const REST_PANTS_W_VW = 0.12;

// Snap transition tuning — premium, no bounce/elastic
const SNAP_TRANSITION = { type: "spring" as const, stiffness: 220, damping: 30, mass: 1 };
const GARMENT_SPRING = { stiffness: 220, damping: 30, restDelta: 0.001 };

// Minimum horizontal drag/swipe distance (px) to trigger a snap
const SWIPE_THRESHOLD_PX = 50;
// Minimum cumulative horizontal wheel delta (px) to trigger a snap
const WHEEL_THRESHOLD_PX = 40;
// Cooldown after a wheel-triggered snap so one gesture doesn't fire multiple times
const WHEEL_COOLDOWN_MS = 500;

type BoxDims = { left: number; top: number; width: number; height: number };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

// ─── Per-garment animated layer ───────────────────────────────────────────────
//
// Each garment is a motion.img absolutely positioned in the sticky container.
// Its left / top / width / rotate are driven by activeProg via MotionValues,
// so they update on every frame without React re-renders.

type GarmentLayerProps = {
  src: string;
  alt: string;
  // Admin-saved position in virtual canvas coordinates
  wornCX: number;
  wornCY: number;
  wornWidth: number;
  wornRotation: number;
  // Resting position (viewport fractions)
  restYVh: number;
  restWVw: number;
  // Natural image aspect ratio (h / w) — needed for vertical centering
  ratio: number;
  // Which outfit slot this belongs to
  index: number;
  // Active outfit index, eased toward target on every gesture (0 → N−1)
  activeProg: MotionValue<number>;
  // Box dims and resize trigger (refs/MVs so transforms always see latest values)
  boxDimsRef: React.RefObject<BoxDims>;
  resizeMV: MotionValue<number>;
  zIndex: number;
};

function GarmentLayer({
  src, alt,
  wornCX, wornCY, wornWidth, wornRotation,
  restYVh, restWVw,
  ratio,
  index, activeProg,
  boxDimsRef, resizeMV,
  zIndex,
}: GarmentLayerProps) {
  // How far this outfit is from the active center (in slot units)
  const offset = useTransform(activeProg, (p) => index - p);

  // wornT: 0 = fully resting, 1 = fully on model
  const wornT = useTransform(offset, (off) => clamp01(1 - Math.abs(off)));

  // left: lerp between resting slot center and worn admin position
  const styleLeft = useTransform(
    [offset, wornT, resizeMV] as MotionValue<number>[],
    ([off, wt]: number[]) => {
      const vw = window.innerWidth;
      const bd = boxDimsRef.current!;

      const restW = vw * restWVw;
      const wornW = (wornWidth / CANVAS_W) * bd.width;

      // Resting center X: viewport center + slot offset
      const restCX = vw / 2 + off * (vw * SLOT_VW);
      // Worn center X: admin position mapped to sticky-container pixels
      const wornCXpx = bd.left + (wornCX / CANVAS_W) * bd.width;

      const cx = lerp(restCX, wornCXpx, wt);
      const w = lerp(restW, wornW, wt);
      return cx - w / 2;
    }
  );

  // top: lerp between resting vertical band and worn admin position
  const styleTop = useTransform(
    [offset, wornT, resizeMV] as MotionValue<number>[],
    ([_off, wt]: number[]) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bd = boxDimsRef.current!;

      const restW = vw * restWVw;
      const restH = restW * ratio;
      const wornW = (wornWidth / CANVAS_W) * bd.width;
      const wornH = wornW * ratio;

      // Resting center Y: fixed band within viewport
      const restCY = vh * restYVh;
      // Worn center Y: admin position mapped to sticky-container pixels
      const wornCYpx = bd.top + (wornCY / CANVAS_H) * bd.height;

      const cy = lerp(restCY, wornCYpx, wt);
      const h = lerp(restH, wornH, wt);
      return cy - h / 2;
    }
  );

  // width: lerp between resting thumbnail size and worn admin size
  const styleWidth = useTransform(
    [offset, wornT, resizeMV] as MotionValue<number>[],
    ([_off, wt]: number[]) => {
      const vw = window.innerWidth;
      const bd = boxDimsRef.current!;
      return lerp(vw * restWVw, (wornWidth / CANVAS_W) * bd.width, wt);
    }
  );

  // rotate: lerp from 0° (resting flat lay) to admin rotation (worn)
  const styleRotate = useTransform(wornT, (wt) =>
    lerp(0, wornRotation, wt)
  );

  return (
    <motion.img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        position: "absolute",
        left: styleLeft,
        top: styleTop,
        width: styleWidth,
        height: "auto",
        rotate: styleRotate,
        zIndex,
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

// ─── Caption for the active outfit ───────────────────────────────────────────

function ActiveCaption({
  configs,
  activeIndex,
}: {
  configs: OutfitConfig[];
  activeIndex: number;
}) {
  const config = configs[activeIndex];
  if (!config) return null;

  return (
    <motion.div
      key={activeIndex}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-3 px-4 text-center pointer-events-none"
    >
      {(config.title || config.subtitle) && (
        <div>
          {config.title && (
            <p className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
              {config.title}
            </p>
          )}
          {config.subtitle && (
            <p className="mt-1 text-xs text-gray-700 sm:text-sm">{config.subtitle}</p>
          )}
        </div>
      )}
      <Link
        href={config.href || "/looks"}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-700"
      >
        Shop This Look <span aria-hidden>→</span>
      </Link>
    </motion.div>
  );
}

// ─── Swipe hint ───────────────────────────────────────────────────────────────

function SwipeHint({ hasInteracted }: { hasInteracted: boolean }) {
  if (hasInteracted) return null;

  return (
    <motion.div
      className="absolute bottom-28 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 text-center text-gray-800/50 text-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
    >
      <span className="tracking-widest uppercase text-[10px]">swipe or scroll sideways</span>
      <motion.span
        animate={{ x: [0, 6, 0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="text-base"
      >
        ↔
      </motion.span>
    </motion.div>
  );
}

// ─── Public entry point ───────────────────────────────────────────────────────

type Props = { configs: OutfitConfig[] };

export function PublicTryOnAnimation({ configs }: Props) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Box dimensions stored in a ref — transforms read it on every frame
  const boxDimsRef = useRef<BoxDims>({ left: 0, top: 0, width: 0, height: 0 });

  // Incrementing MotionValue forces position transforms to recompute on resize
  const resizeMV = useMotionValue(0);

  // Natural image aspect ratios (h/w) for vertical centering math
  const [ratios, setRatios] = useState<Record<string, number>>({});

  // Active outfit index (snapped, whole number) — drives caption + hint state
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Eased progress toward the active index — drives all garment transforms.
  // Animated imperatively via `animate()` on every gesture-triggered snap,
  // never tied to scroll position.
  const activeProg = useMotionValue(0);

  useMotionValueEvent(activeProg, "change", (v) => {
    const rounded = Math.round(v);
    if (rounded !== activeIndexRef.current) {
      activeIndexRef.current = rounded;
      setActiveIndex(rounded);
    }
  });

  const N = configs.length;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(N - 1, next));
      setHasInteracted(true);
      animate(activeProg, clamped, SNAP_TRANSITION);
    },
    [N, activeProg]
  );

  // Gesture state refs (no re-renders during a drag/wheel sequence)
  const dragStartX = useRef<number | null>(null);
  const dragStartIndex = useRef(0);
  const wheelAccum = useRef(0);
  const wheelCooldownUntil = useRef(0);

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;

    function targetIndexFromProg() {
      return Math.round(activeProg.get());
    }

    function onWheel(e: WheelEvent) {
      // Only intercept clearly-horizontal intent; vertical scroll passes through untouched.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      const now = performance.now();
      if (now < wheelCooldownUntil.current) return;

      wheelAccum.current += e.deltaX;
      if (Math.abs(wheelAccum.current) >= WHEEL_THRESHOLD_PX) {
        const dir = wheelAccum.current > 0 ? 1 : -1;
        wheelAccum.current = 0;
        wheelCooldownUntil.current = now + WHEEL_COOLDOWN_MS;
        goTo(targetIndexFromProg() + dir);
      }
    }

    function onPointerDown(e: PointerEvent) {
      dragStartX.current = e.clientX;
      dragStartIndex.current = targetIndexFromProg();
    }

    function onPointerMove(e: PointerEvent) {
      if (dragStartX.current === null) return;
      const dx = e.clientX - dragStartX.current;
      // Live-follow the drag for immediate, pixel-accurate feedback
      const vw = window.innerWidth;
      const slotPx = vw * SLOT_VW;
      activeProg.set(dragStartIndex.current - dx / slotPx);
    }

    function onPointerUp(e: PointerEvent) {
      if (dragStartX.current === null) return;
      const dx = e.clientX - dragStartX.current;
      dragStartX.current = null;

      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
        const dir = dx > 0 ? -1 : 1;
        goTo(dragStartIndex.current + dir);
      } else {
        goTo(dragStartIndex.current);
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [activeProg, goTo]);

  useEffect(() => {
    function measure() {
      const box = boxRef.current;
      const sticky = stickyRef.current;
      if (!box || !sticky) return;
      const br = box.getBoundingClientRect();
      const sr = sticky.getBoundingClientRect();
      boxDimsRef.current = {
        left: br.left - sr.left,
        top: br.top - sr.top,
        width: br.width,
        height: br.height,
      };
      resizeMV.set(resizeMV.get() + 1);
    }

    measure();
    const ro = new ResizeObserver(measure);
    if (boxRef.current) ro.observe(boxRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [resizeMV]);

  // Collect all unique garment URLs for the preloader
  const allSrcs = Array.from(
    new Set(configs.flatMap((c) => [c.shirtSrc, c.pantsSrc].filter(Boolean)))
  ) as string[];

  // Guard AFTER all hooks — hooks must always run unconditionally
  if (configs.length === 0) return null;

  return (
    <div
      ref={stickyRef}
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        touchAction: "pan-y",
        background:
          "radial-gradient(ellipse 80% 90% at 50% 60%, #f6d3ee 0%, #f0aadf 40%, #e879cf 75%, #db63c2 100%)",
      }}
    >
      {/* ── Model — stays fixed at center. Always behind garments ── */}
      <div
        ref={boxRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(100vw, calc(100vh * 3 / 5))",
          aspectRatio: "3 / 5",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/outfits/model.png"
          alt="LOKYO model"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
          }}
          draggable={false}
        />
      </div>

      {/* ── All outfit garments — always present, morph between resting and worn ── */}
      {configs.map((config, i) => {
        // Fall back to sensible defaults until the preloader images load
        const shirtRatio = ratios[config.shirtSrc] ?? 1.2;
        const pantsRatio = ratios[config.pantsSrc] ?? 2.0;

        return (
          <div key={config.slotId}>
            {/* Pants — rendered below shirt */}
            {config.pantsSrc && (
              <GarmentLayer
                src={config.pantsSrc}
                alt=""
                wornCX={config.pantsX}
                wornCY={config.pantsY}
                wornWidth={config.pantsWidth}
                wornRotation={config.pantsRotation}
                restYVh={REST_PANTS_Y_VH}
                restWVw={REST_PANTS_W_VW}
                ratio={pantsRatio}
                index={i}
                activeProg={activeProg}
                boxDimsRef={boxDimsRef}
                resizeMV={resizeMV}
                zIndex={6}
              />
            )}
            {/* Shirt — rendered above pants */}
            {config.shirtSrc && (
              <GarmentLayer
                src={config.shirtSrc}
                alt={config.title}
                wornCX={config.shirtX}
                wornCY={config.shirtY}
                wornWidth={config.shirtWidth}
                wornRotation={config.shirtRotation}
                restYVh={REST_SHIRT_Y_VH}
                restWVw={REST_SHIRT_W_VW}
                ratio={shirtRatio}
                index={i}
                activeProg={activeProg}
                boxDimsRef={boxDimsRef}
                resizeMV={resizeMV}
                zIndex={7}
              />
            )}
          </div>
        );
      })}

      {/* ── Hidden preloader — captures natural image ratios ── */}
      <div
        aria-hidden
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", top: 0, left: 0 }}
      >
        {allSrcs.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth > 0) {
                setRatios((prev) => ({
                  ...prev,
                  [src]: img.naturalHeight / img.naturalWidth,
                }));
              }
            }}
          />
        ))}
      </div>

      {/* ── Caption for active outfit ── */}
      <ActiveCaption configs={configs} activeIndex={activeIndex} />

      {/* ── Swipe hint ── */}
      {N > 1 && <SwipeHint hasInteracted={hasInteracted} />}
    </div>
  );
}
