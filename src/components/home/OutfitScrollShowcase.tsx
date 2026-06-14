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

type Outfit = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  href: string;
};

const OUTFITS: Outfit[] = [
  {
    id: "1",
    title: "Campus Cool",
    subtitle: "White cardigan · crop tank · tailored shorts",
    src: "/outfits/outfit-1.png",
    href: "/looks",
  },
  {
    id: "2",
    title: "Street Minimal",
    subtitle: "Black crop tee · wide-leg baggy jeans",
    src: "/outfits/outfit-3.png",
    href: "/looks",
  },
  {
    id: "3",
    title: "Denim Dream",
    subtitle: "Lace bralette · wide-leg baggy jeans",
    src: "/outfits/outfit-2.png",
    href: "/looks",
  },
];

const TOTAL = OUTFITS.length;
const T = 0.25;

function slice(index: number) {
  const start = index / TOTAL;
  const end = (index + 1) / TOTAL;
  const span = end - start;
  return { start, end, enterEnd: start + span * T, exitStart: end - span * T };
}

/**
 * Full composite image split by clip-path:
 * top half slides in from LEFT, bottom half from RIGHT.
 * model.png sits underneath as the fixed base — no masking needed.
 */
function OutfitHalves({
  outfit,
  index,
  progress,
}: {
  outfit: Outfit;
  index: number;
  progress: MotionValue<number>;
}) {
  const { start, end, enterEnd, exitStart } = slice(index);
  const first = index === 0;
  const last = index === TOTAL - 1;

  const inputRange = first
    ? [start, exitStart, end]
    : last
      ? [start, enterEnd, end]
      : [start, enterEnd, exitStart, end];

  const topXRaw = useTransform(
    progress,
    inputRange,
    first ? [0, 0, -100] : last ? [-100, 0, 0] : [-100, 0, 0, -100]
  );
  const bottomXRaw = useTransform(
    progress,
    inputRange,
    first ? [0, 0, 100] : last ? [100, 0, 0] : [100, 0, 0, 100]
  );

  const topX    = useSpring(topXRaw,    { stiffness: 120, damping: 24 });
  const bottomX = useSpring(bottomXRaw, { stiffness: 120, damping: 24 });
  const topXPct    = useTransform(topX,    (v) => `${v}%`);
  const bottomXPct = useTransform(bottomX, (v) => `${v}%`);

  const opacity = useTransform(
    progress,
    inputRange,
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]
  );

  const imgClass =
    "absolute inset-0 h-full w-full select-none object-contain object-center";

  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0">
      {/* Top half — slides from the left */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={outfit.src}
        alt={outfit.title}
        style={{ x: topXPct, clipPath: "inset(0 0 50% 0)" }}
        className={imgClass}
        draggable={false}
        loading={first ? "eager" : "lazy"}
      />
      {/* Bottom half — slides from the right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={outfit.src}
        alt=""
        aria-hidden
        style={{ x: bottomXPct, clipPath: "inset(50% 0 0 0)" }}
        className={imgClass}
        draggable={false}
        loading={first ? "eager" : "lazy"}
      />
    </motion.div>
  );
}

function Caption({
  outfit,
  index,
  progress,
}: {
  outfit: Outfit;
  index: number;
  progress: MotionValue<number>;
}) {
  const { start, end, enterEnd, exitStart } = slice(index);
  const first = index === 0;
  const last = index === TOTAL - 1;

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

function CounterItem({
  index,
  progress,
}: {
  index: number;
  progress: MotionValue<number>;
}) {
  const { start, end, enterEnd, exitStart } = slice(index);
  const first = index === 0;
  const last = index === TOTAL - 1;
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
      {String(index + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
    </motion.p>
  );
}

function Dot({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const { start, end } = slice(index);
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

export function OutfitScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative h-[400vh]">
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 90% at 50% 60%, #f6d3ee 0%, #f0aadf 40%, #e879cf 75%, #db63c2 100%)",
        }}
      >
        {/* Base model — always visible, never moves */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/outfits/model.png"
          alt="LOKYO model"
          className="absolute inset-0 h-full w-full select-none object-contain object-center"
          draggable={false}
        />

        {/* Outfit halves: top from left, bottom from right */}
        <div className="absolute inset-0 z-10">
          {OUTFITS.map((o, i) => (
            <OutfitHalves key={o.id} outfit={o} index={i} progress={scrollYProgress} />
          ))}
        </div>

        {/* Captions */}
        {OUTFITS.map((o, i) => (
          <Caption key={o.id} outfit={o} index={i} progress={scrollYProgress} />
        ))}

        {/* Counter 01/03 */}
        <div className="absolute left-5 top-6 z-30">
          {OUTFITS.map((_, i) => (
            <CounterItem key={i} index={i} progress={scrollYProgress} />
          ))}
        </div>

        {/* Right dots */}
        <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
          {OUTFITS.map((_, i) => (
            <Dot key={i} index={i} progress={scrollYProgress} />
          ))}
        </div>

        <ScrollHint progress={scrollYProgress} />
        <ProgressBar progress={scrollYProgress} />
      </div>
    </section>
  );
}
