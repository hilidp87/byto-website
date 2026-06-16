"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useAnimate, useInView } from "framer-motion";
import type { OutfitConfig } from "@/types";

/**
 * COORDINATE SYSTEM — must match AlignmentCanvas.tsx exactly:
 *
 *   Virtual canvas: CANVAS_W × CANVAS_H (600 × 1000)
 *   Container CSS : width = min(100vw, calc(100vh * 3/5))  ←  same formula as admin editor
 *                   aspect-ratio = 3/5
 *
 * The garment anchor div uses:
 *   left  = (x / CANVAS_W) * 100%    ← % of this container, not the viewport
 *   top   = (y / CANVAS_H) * 100%
 *   width = (w / CANVAS_W) * 100%
 *   transform: translate(-50%, -50%)  ← center the image at (x,y)
 */
const CANVAS_W = 600;
const CANVAS_H = 1000;

/** Expo-out easing for the garment fly-in */
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
/** Spring for the settle-to-rotation phase */
const SPRING = { type: "spring", stiffness: 200, damping: 26 } as const;

// ─── Debug overlay ───────────────────────────────────────────────────────────
// Add ?debug=1 to any page URL to reveal the coordinate overlay.
function useDebug() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);
  return on;
}

type DebugOverlayProps = {
  config: OutfitConfig;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

function DebugOverlay({ config, containerRef }: DebugOverlayProps) {
  const [info, setInfo] = useState<{
    containerW: number;
    containerH: number;
    shirtRendW: number;
    shirtRendX: number;
    shirtRendY: number;
    pantsRendW: number;
    pantsRendX: number;
    pantsRendY: number;
  } | null>(null);

  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cw = r.width;
      const ch = r.height;
      setInfo({
        containerW: Math.round(cw),
        containerH: Math.round(ch),
        shirtRendW: Math.round((config.shirtWidth / CANVAS_W) * cw),
        shirtRendX: Math.round((config.shirtX / CANVAS_W) * cw),
        shirtRendY: Math.round((config.shirtY / CANVAS_H) * ch),
        pantsRendW: Math.round((config.pantsWidth / CANVAS_W) * cw),
        pantsRendX: Math.round((config.pantsX / CANVAS_W) * cw),
        pantsRendY: Math.round((config.pantsY / CANVAS_H) * ch),
      });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [config, containerRef]);

  if (!info) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 space-y-1 bg-black/70 p-3 font-mono text-[10px] text-green-400">
      <p className="text-yellow-300 font-bold">DEBUG — {config.slotId}</p>
      <p>Container: {info.containerW} × {info.containerH}px  (saved CANVAS: {CANVAS_W}×{CANVAS_H})</p>
      <p>── Shirt saved ──  x:{Math.round(config.shirtX)} y:{Math.round(config.shirtY)} w:{Math.round(config.shirtWidth)} r:{config.shirtRotation.toFixed(1)}°</p>
      <p>── Shirt render ─  x:{info.shirtRendX}px y:{info.shirtRendY}px w:{info.shirtRendW}px</p>
      <p>── Pants saved ──  x:{Math.round(config.pantsX)} y:{Math.round(config.pantsY)} w:{Math.round(config.pantsWidth)} r:{config.pantsRotation.toFixed(1)}°</p>
      <p>── Pants render ─  x:{info.pantsRendX}px y:{info.pantsRendY}px w:{info.pantsRendW}px</p>
    </div>
  );
}

// ─── Per-garment anchor ──────────────────────────────────────────────────────
// Positions the garment so its centre is at (x, y) using the same formula
// as AlignmentCanvas → AlignmentCanvas.garmentImgStyle.
function anchorStyle(x: number, y: number, width: number): React.CSSProperties {
  return {
    position: "absolute",
    left: `${(x / CANVAS_W) * 100}%`,
    top: `${(y / CANVAS_H) * 100}%`,
    width: `${(width / CANVAS_W) * 100}%`,
    transform: "translate(-50%, -50%)",
    transformOrigin: "center center",
    pointerEvents: "none",
  };
}

// ─── Single outfit section ───────────────────────────────────────────────────
function OutfitSection({ config, debug }: { config: OutfitConfig; debug: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  // The 3:5 model+garments box — separate from the full-screen section
  const boxRef = useRef<HTMLDivElement>(null);
  const [, animate] = useAnimate();
  const shirtRef = useRef<HTMLImageElement>(null);
  const pantsRef = useRef<HTMLImageElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(sectionRef, { amount: 0.45, once: false });

  useEffect(() => {
    const shirt = shirtRef.current;
    const pants = pantsRef.current;
    const caption = captionRef.current;

    if (isInView) {
      // Reset both to offscreen instantly
      if (pants) animate(pants, { x: "-110vw", opacity: 0, rotate: 0 }, { duration: 0 });
      if (shirt) animate(shirt, { x: "110vw",  opacity: 0, rotate: 0 }, { duration: 0 });
      if (caption) animate(caption, { opacity: 0, y: 20 }, { duration: 0 });

      // Step 1 — pants slides from left
      if (pants)
        animate(pants, { x: 0, opacity: 1 }, { duration: 0.65, ease: EASE_EXPO });

      // Step 2 — shirt slides from right (280 ms stagger)
      if (shirt)
        animate(shirt, { x: 0, opacity: 1 }, { duration: 0.65, ease: EASE_EXPO, delay: 0.28 });

      // Steps 3-5 — settle into saved rotation with spring
      if (pants)
        animate(pants, { rotate: config.pantsRotation }, { ...SPRING, delay: 0.70 });
      if (shirt)
        animate(shirt, { rotate: config.shirtRotation }, { ...SPRING, delay: 0.85 });

      // Caption rises in
      if (caption)
        animate(caption, { opacity: 1, y: 0 }, { duration: 0.5, ease: "easeOut", delay: 1.1 });
    } else {
      // Exit — fly back out, shorter duration so they clear before next outfit enters
      if (pants) animate(pants, { x: "-80vw", opacity: 0 }, { duration: 0.35, ease: "easeIn" });
      if (shirt) animate(shirt, { x: "80vw",  opacity: 0 }, { duration: 0.35, ease: "easeIn" });
      if (caption) animate(caption, { opacity: 0, y: 8 }, { duration: 0.25 });
    }
  }, [isInView]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasShirt = Boolean(config.shirtSrc);
  const hasPants = Boolean(config.pantsSrc);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 90% at 50% 60%, #f6d3ee 0%, #f0aadf 40%, #e879cf 75%, #db63c2 100%)",
      }}
    >
      {/*
       * ── Garment box ─────────────────────────────────────────────────────
       * Exact same sizing formula as AlignmentCanvas, so percentages map 1:1.
       * No max-width cap here — let it fill to 100vh × 3/5 width on desktop.
       *)
       */}
      <div
        ref={boxRef}
        className="relative overflow-hidden"
        style={{
          width: "min(100vw, calc(100vh * 3 / 5))",
          aspectRatio: "3 / 5",
          flexShrink: 0,
        }}
      >
        {/* Model — fills the 3:5 box exactly (same ratio as image) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/outfits/model.png"
          alt="LOKYO model"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
          draggable={false}
        />

        {/* Pants — under shirt */}
        {hasPants && (
          <div style={anchorStyle(config.pantsX, config.pantsY, config.pantsWidth)}>
            <motion.img
              ref={pantsRef}
              src={config.pantsSrc}
              alt=""
              aria-hidden
              initial={{ x: "-110vw", opacity: 0 }}
              style={{ width: "100%", height: "auto", display: "block" }}
              draggable={false}
            />
          </div>
        )}

        {/* Shirt — over pants */}
        {hasShirt && (
          <div style={anchorStyle(config.shirtX, config.shirtY, config.shirtWidth)}>
            <motion.img
              ref={shirtRef}
              src={config.shirtSrc}
              alt={config.title}
              initial={{ x: "110vw", opacity: 0 }}
              style={{ width: "100%", height: "auto", display: "block" }}
              draggable={false}
            />
          </div>
        )}

        {/* Debug overlay */}
        {debug && <DebugOverlay config={config} containerRef={boxRef} />}
      </div>

      {/* Caption — lives outside the 3:5 box so it can sit at the bottom of the section */}
      <motion.div
        ref={captionRef}
        initial={{ opacity: 0, y: 20 }}
        className="z-10 mt-6 flex flex-col items-center gap-3 px-4 text-center"
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
        {(hasShirt || hasPants) && (
          <Link
            href={config.href || "/looks"}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-700"
          >
            Shop This Look <span aria-hidden>→</span>
          </Link>
        )}
      </motion.div>
    </section>
  );
}

// ─── Public entry point ──────────────────────────────────────────────────────
type Props = { configs: OutfitConfig[] };

export function PublicTryOnAnimation({ configs }: Props) {
  const debug = useDebug();
  if (configs.length === 0) return null;

  return (
    <div className="relative">
      {configs.map((config) => (
        <OutfitSection key={config.slotId} config={config} debug={debug} />
      ))}
    </div>
  );
}
