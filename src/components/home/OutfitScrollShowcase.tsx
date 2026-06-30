"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";

type OutfitSources = Record<string, { topSrc: string; bottomSrc: string }>;

type Outfit = {
  id: string;
  title: string;
  subtitle: string;
  top: string;
  bottom: string;
  href: string;
};

const OUTFITS: Outfit[] = [
  {
    id: "1",
    title: "Campus Cool",
    subtitle: "White cardigan · crop tank · tailored shorts",
    top: "/outfits/outfit-1-top.png",
    bottom: "/outfits/outfit-1-bottom.png",
    href: "/looks",
  },
  {
    id: "2",
    title: "Street Minimal",
    subtitle: "Black crop tee · wide-leg baggy jeans",
    top: "/outfits/outfit-3-top.png",
    bottom: "/outfits/outfit-3-bottom.png",
    href: "/looks",
  },
  {
    id: "3",
    title: "Denim Dream",
    subtitle: "Lace bralette · wide-leg baggy jeans",
    top: "/outfits/outfit-2-top.png",
    bottom: "/outfits/outfit-2-bottom.png",
    href: "/looks",
  },
  // Slots 4-10 — no committed local fallback images. They only appear once a
  // garment has been uploaded for them in the admin (sources[`outfit-N`]);
  // empty slots are filtered out below so no broken/empty frame is rendered.
  ...Array.from({ length: 7 }, (_, i) => {
    const id = String(i + 4);
    return {
      id,
      title: `Style ${id}`,
      subtitle: "",
      top: "",
      bottom: "",
      href: "/looks",
    } satisfies Outfit;
  }),
];

/** fraction of each outfit's slice spent on the slide-in / slide-out transition */
const T = 0.25;

/** Per-outfit slice boundaries of the global scroll progress */
function slice(index: number, total: number) {
  const start = index / total;
  const end = (index + 1) / total;
  const span = end - start;
  return { start, end, enterEnd: start + span * T, exitStart: end - span * T };
}

/** Top garment slides in from the LEFT, bottom from the RIGHT */
function GarmentLayers({
  outfit,
  topSrc,
  bottomSrc,
  index,
  total,
  progress,
}: {
  outfit: Outfit;
  topSrc: string;
  bottomSrc: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const { start, end, enterEnd, exitStart } = slice(index, total);
  const first = index === 0;
  const last = index === total - 1;

  // raw x-position percentages, then smoothed with a spring
  const topXRaw = useTransform(
    progress,
    first
      ? [start, exitStart, end]
      : last
        ? [start, enterEnd, end]
        : [start, enterEnd, exitStart, end],
    first
      ? [0, 0, -100]
      : last
        ? [-100, 0, 0]
        : [-100, 0, 0, -100]
  );
  const bottomXRaw = useTransform(
    progress,
    first
      ? [start, exitStart, end]
      : last
        ? [start, enterEnd, end]
        : [start, enterEnd, exitStart, end],
    first
      ? [0, 0, 100]
      : last
        ? [100, 0, 0]
        : [100, 0, 0, 100]
  );
  const topX = useSpring(topXRaw, { stiffness: 120, damping: 24 });
  const bottomX = useSpring(bottomXRaw, { stiffness: 120, damping: 24 });
  const topXPct = useTransform(topX, (v) => `${v}%`);
  const bottomXPct = useTransform(bottomX, (v) => `${v}%`);

  const opacity = useTransform(
    progress,
    first
      ? [start, exitStart, end]
      : last
        ? [start, enterEnd, end]
        : [start, enterEnd, exitStart, end],
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]
  );

  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0">
      {/* bottom garment — from the right, under the top */}
      <motion.img
        src={bottomSrc}
        alt=""
        aria-hidden
        style={{ x: bottomXPct }}
        className="absolute inset-0 h-full w-full select-none object-contain object-center"
        draggable={false}
        loading={first ? "eager" : "lazy"}
      />
      {/* top garment — from the left, over the bottom */}
      <motion.img
        src={topSrc}
        alt={outfit.title}
        style={{ x: topXPct }}
        className="absolute inset-0 h-full w-full select-none object-contain object-center"
        draggable={false}
        loading={first ? "eager" : "lazy"}
      />
    </motion.div>
  );
}

/** Outfit name, subtitle, CTA — fades in below the model per outfit */
function Caption({
  outfit,
  index,
  total,
  progress,
}: {
  outfit: Outfit;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const { start, end, enterEnd, exitStart } = slice(index, total);
  const first = index === 0;
  const last = index === total - 1;

  const opacity = useTransform(
    progress,
    first
      ? [start, exitStart, end]
      : last
        ? [start, enterEnd, end]
        : [start, enterEnd, exitStart, end],
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]
  );
  const y = useTransform(progress, [start, enterEnd], [24, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-2.5 px-4 text-center sm:bottom-10"
    >
      <div>
        <p className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
          {outfit.title}
        </p>
        <p className="mt-1 text-xs text-gray-600 sm:text-sm">{outfit.subtitle}</p>
      </div>
      <Link
        href={outfit.href}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
      >
        Shop This Look <span aria-hidden>→</span>
      </Link>
    </motion.div>
  );
}

/** 01 / 03 counter, top-left */
function CounterItem({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const { start, end, enterEnd, exitStart } = slice(index, total);
  const first = index === 0;
  const last = index === total - 1;
  const opacity = useTransform(
    progress,
    first
      ? [start, exitStart, end]
      : last
        ? [start, enterEnd, end]
        : [start, enterEnd, exitStart, end],
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]
  );
  return (
    <motion.p
      style={{ opacity }}
      className="absolute text-xs font-semibold uppercase tracking-widest text-gray-700"
    >
      {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </motion.p>
  );
}

/** Right-side navigation dot */
function Dot({ index, total, progress }: { index: number; total: number; progress: MotionValue<number> }) {
  const { start, end } = slice(index, total);
  const pad = 0.02;
  const scale = useTransform(
    progress,
    [start - pad, start, end, end + pad],
    [1, 1.5, 1.5, 1]
  );
  const opacity = useTransform(
    progress,
    [start - pad, start, end, end + pad],
    [0.3, 1, 1, 0.3]
  );
  return (
    <motion.span
      style={{ scale, opacity }}
      className="block h-2 w-2 rounded-full bg-gray-900 sm:h-2.5 sm:w-2.5"
    />
  );
}

/** "SCROLL" hint — fades out after the first scroll */
function ScrollHint({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.05], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-24 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5 sm:bottom-28"
    >
      <span className="text-[10px] uppercase tracking-[0.35em] text-gray-600 sm:text-xs">
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        className="h-5 w-px bg-gray-600"
      />
    </motion.div>
  );
}

function ProgressBar({ progress }: { progress: MotionValue<number> }) {
  const scaleX = useSpring(progress, { stiffness: 200, damping: 30 });
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-black/10">
      <motion.div style={{ scaleX, originX: 0 }} className="h-full bg-gray-900" />
    </div>
  );
}

export function OutfitScrollShowcase({
  sources = {},
}: {
  sources?: OutfitSources;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Resolve each slot to its effective garment images, preferring uploaded
  // sources and falling back to any committed local image (slots 1-3). Slots
  // without a usable image (empty 4-10) are skipped so no broken/empty frame
  // is shown. The remaining outfits are re-indexed so the animation logic is
  // identical to the original — just over however many outfits actually exist.
  const visible = OUTFITS.map((o) => {
    const s = sources[`outfit-${o.id}`];
    const topSrc = s?.topSrc || o.top;
    const bottomSrc = s?.bottomSrc || o.bottom;
    return { outfit: o, topSrc, bottomSrc };
  }).filter((v) => v.topSrc && v.bottomSrc);

  const total = visible.length;

  // Scroll height scales with the number of outfits so each one keeps the same
  // ~100vh of scroll as the original 3-outfit version (3 → 400vh, unchanged).
  const sectionHeight = `${(total + 1) * 100}vh`;

  return (
    <section ref={containerRef} className="relative" style={{ height: sectionHeight }}>
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 90% at 50% 60%, #f6d3ee 0%, #f0aadf 40%, #e879cf 75%, #db63c2 100%)",
        }}
      >
        {/* Fixed model — always visible under garments */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/outfits/model.png"
          alt="LOKYO model"
          className="absolute inset-0 h-full w-full select-none object-contain object-center"
          draggable={false}
        />

        {/* Garment layers: tops from left, bottoms from right */}
        <div className="absolute inset-0 z-10">
          {visible.map((v, i) => (
            <GarmentLayers
              key={v.outfit.id}
              outfit={v.outfit}
              topSrc={v.topSrc}
              bottomSrc={v.bottomSrc}
              index={i}
              total={total}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* Captions */}
        {visible.map((v, i) => (
          <Caption key={v.outfit.id} outfit={v.outfit} index={i} total={total} progress={scrollYProgress} />
        ))}

        {/* Counter 01/NN */}
        <div className="absolute left-5 top-6 z-30">
          {visible.map((v, i) => (
            <CounterItem key={v.outfit.id} index={i} total={total} progress={scrollYProgress} />
          ))}
        </div>

        {/* Right dots */}
        <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
          {visible.map((v, i) => (
            <Dot key={v.outfit.id} index={i} total={total} progress={scrollYProgress} />
          ))}
        </div>

        <ScrollHint progress={scrollYProgress} />
        <ProgressBar progress={scrollYProgress} />
      </div>
    </section>
  );
}
