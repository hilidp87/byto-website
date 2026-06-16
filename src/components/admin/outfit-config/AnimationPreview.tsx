"use client";

import { useRef } from "react";
import { motion, useAnimate } from "framer-motion";
import type { GarmentState } from "./AlignmentCanvas";
import { CANVAS_W, CANVAS_H } from "./AlignmentCanvas";

type Props = {
  shirt: GarmentState;
  pants: GarmentState;
};

export function AnimationPreview({ shirt, pants }: Props) {
  const [scope, animate] = useAnimate();
  const shirtRef = useRef<HTMLImageElement>(null);
  const pantsRef = useRef<HTMLImageElement>(null);
  const playingRef = useRef(false);

  async function play() {
    if (playingRef.current) return;
    playingRef.current = true;
    const s = shirtRef.current;
    const p = pantsRef.current;
    if (!s || !p) { playingRef.current = false; return; }

    // Reset off-screen instantly
    await Promise.all([
      animate(s, { x: "100vw", opacity: 0, rotate: 0 }, { duration: 0 }),
      animate(p, { x: "-100vw", opacity: 0, rotate: 0 }, { duration: 0 }),
    ]);

    // Step 1 — pants slides in from left
    animate(p, { x: 0, opacity: 1 }, { duration: 0.55, ease: [0.22, 1, 0.36, 1] });

    // Step 2 — shirt slides in from right (250ms delay)
    await animate(s, { x: 0, opacity: 1 }, { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.25 });

    // Step 3-5 — both settle into saved rotation with spring
    await Promise.all([
      animate(s, { rotate: shirt.rotation }, { type: "spring", stiffness: 220, damping: 22 }),
      animate(p, { rotate: pants.rotation }, { type: "spring", stiffness: 220, damping: 22 }),
    ]);

    playingRef.current = false;
  }

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Live Preview
        </p>
        <button
          onClick={play}
          className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700"
        >
          ▶ Play animation
        </button>
      </div>

      <div
        ref={scope}
        className="relative mx-auto overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-b from-pink-50 to-rose-100"
        style={{ width: "100%", maxWidth: 280, aspectRatio: "3/5" }}
      >
        {/* Model */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/outfits/model.png"
          alt="model"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

        {/* Pants — wrapper div centers it; motion.img animates the x offset */}
        {pants.src && (
          <div style={anchorStyle(pants.x, pants.y, pants.width)}>
            <motion.img
              ref={pantsRef}
              src={pants.src}
              alt=""
              aria-hidden
              initial={{ x: "-100vw", opacity: 0 }}
              style={{ width: "100%", height: "auto", display: "block" }}
              draggable={false}
            />
          </div>
        )}

        {/* Shirt — wrapper div centers it; motion.img animates the x offset */}
        {shirt.src && (
          <div style={anchorStyle(shirt.x, shirt.y, shirt.width)}>
            <motion.img
              ref={shirtRef}
              src={shirt.src}
              alt=""
              aria-hidden
              initial={{ x: "100vw", opacity: 0 }}
              style={{ width: "100%", height: "auto", display: "block" }}
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
