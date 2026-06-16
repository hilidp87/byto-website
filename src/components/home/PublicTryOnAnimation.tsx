"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useAnimate, useInView } from "framer-motion";
import type { OutfitConfig } from "@/types";

const CANVAS_W = 600;
const CANVAS_H = 1000;

/** Spring preset for the settle-into-position phase */
const SETTLE_SPRING = { type: "spring", stiffness: 200, damping: 26 } as const;

/** Cubic-bezier matching CSS ease-out-expo */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function OutfitSection({ config }: { config: OutfitConfig }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [, animate] = useAnimate();
  const shirtRef = useRef<HTMLImageElement>(null);
  const pantsRef = useRef<HTMLImageElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);

  const isInView = useInView(sectionRef, { amount: 0.45, once: false });

  useEffect(() => {
    const shirt = shirtRef.current;
    const pants = pantsRef.current;
    const caption = captionRef.current;
    if (!shirt || !pants) return;

    if (isInView) {
      // ── Entry sequence ────────────────────────────────────────────────
      animatingRef.current = true;

      // Reset instantly to off-screen start state
      animate(pants, { x: "-110vw", opacity: 0, rotate: 0 }, { duration: 0 });
      animate(shirt, { x: "110vw", opacity: 0, rotate: 0 }, { duration: 0 });
      if (caption) animate(caption, { opacity: 0, y: 20 }, { duration: 0 });

      // Step 1 — pants flies in from the LEFT
      animate(
        pants,
        { x: 0, opacity: 1 },
        { duration: 0.65, ease: EASE_OUT_EXPO }
      );

      // Step 2 — shirt flies in from the RIGHT (staggered 280ms)
      animate(
        shirt,
        { x: 0, opacity: 1 },
        { duration: 0.65, ease: EASE_OUT_EXPO, delay: 0.28 }
      );

      // Steps 3-5 — settle into admin-configured rotation with spring
      animate(
        pants,
        { rotate: config.pantsRotation },
        { ...SETTLE_SPRING, delay: 0.7 }
      );
      animate(
        shirt,
        { rotate: config.shirtRotation },
        { ...SETTLE_SPRING, delay: 0.85 }
      );

      // Caption fades up after garments settle
      if (caption) {
        animate(caption, { opacity: 1, y: 0 }, { duration: 0.5, ease: "easeOut", delay: 1.1 });
      }
    } else {
      // ── Exit — fly back out ───────────────────────────────────────────
      animate(pants, { x: "-80vw", opacity: 0 }, { duration: 0.35, ease: "easeIn" });
      animate(shirt, { x: "80vw", opacity: 0 }, { duration: 0.35, ease: "easeIn" });
      if (caption) animate(caption, { opacity: 0, y: 8 }, { duration: 0.25 });
    }
  }, [isInView]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasShirt = Boolean(config.shirtSrc);
  const hasPants = Boolean(config.pantsSrc);

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
    <section
      ref={sectionRef}
      className="relative flex h-screen items-end justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 90% at 50% 60%, #f6d3ee 0%, #f0aadf 40%, #e879cf 75%, #db63c2 100%)",
      }}
    >
      {/* Model — always visible */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/outfits/model.png"
        alt="LOKYO model"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-center"
        draggable={false}
      />

      {/* Pants — wrapper positions it; motion.img slides in from left */}
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

      {/* Shirt — wrapper positions it; motion.img slides in from right */}
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

      {/* Caption */}
      <motion.div
        ref={captionRef}
        initial={{ opacity: 0, y: 20 }}
        className="relative z-10 mb-10 flex flex-col items-center gap-3 px-4 text-center sm:mb-14"
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

      {/* Progress dot for this section */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        <div className="h-1 w-8 rounded-full bg-white/60" />
      </div>
    </section>
  );
}

/** Dot navigation for multiple sections */
function SectionDots({
  count,
  activeIndex,
}: {
  count: number;
  activeIndex: number;
}) {
  return (
    <div className="fixed right-5 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === activeIndex
              ? "h-3 w-3 bg-gray-900"
              : "h-2 w-2 bg-gray-900/30"
          }`}
        />
      ))}
    </div>
  );
}

type Props = {
  configs: OutfitConfig[];
};

export function PublicTryOnAnimation({ configs }: Props) {
  if (configs.length === 0) return null;

  return (
    <div className="relative">
      {configs.map((config) => (
        <OutfitSection key={config.slotId} config={config} />
      ))}
    </div>
  );
}
