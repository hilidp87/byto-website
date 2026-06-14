"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";

// ---- Types ----
export type GarmentPos = {
  x: string;
  y: string;
  width: string;
  splitY?: number;
};
export type OutfitSlotData = {
  top: GarmentPos;
  bottom: GarmentPos;
};
export type OutfitPositions = Partial<
  Record<"outfit-1" | "outfit-2" | "outfit-3", OutfitSlotData>
>;

// ---- Static outfit config ----
type Outfit = {
  id: string;
  title: string;
  subtitle: string;
  top: string;
  bottom: string;
  positionKey: "outfit-1" | "outfit-2" | "outfit-3";
  href: string;
};

const OUTFITS: Outfit[] = [
  {
    id: "1",
    title: "Campus Cool",
    subtitle: "White cardigan · crop tank · tailored shorts",
    top: "/outfits/outfit-1-top.png",
    bottom: "/outfits/outfit-1-bottom.png",
    positionKey: "outfit-1",
    href: "/looks",
  },
  {
    id: "2",
    title: "Street Minimal",
    subtitle: "Black crop tee · wide-leg baggy jeans",
    top: "/outfits/outfit-3-top.png",
    bottom: "/outfits/outfit-3-bottom.png",
    positionKey: "outfit-3",
    href: "/looks",
  },
  {
    id: "3",
    title: "Denim Dream",
    subtitle: "Lace bralette · wide-leg baggy jeans",
    top: "/outfits/outfit-2-top.png",
    bottom: "/outfits/outfit-2-bottom.png",
    positionKey: "outfit-2",
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

function garmentStyle(pos: GarmentPos | undefined): React.CSSProperties {
  if (!pos) return {};
  const xNum = parseFloat(pos.x);
  const wNum = parseFloat(pos.width);
  const leftPct = xNum - wNum / 2;
  return {
    position: "absolute",
    left: `${leftPct.toFixed(2)}%`,
    top: pos.y,
    width: pos.width,
    height: "auto",
  };
}

const DEFAULT_IMG_CLASS =
  "absolute inset-0 h-full w-full select-none object-contain object-center";
const POSITIONED_IMG_CLASS = "select-none";

function GarmentLayers({
  outfit,
  index,
  progress,
  positions,
}: {
  outfit: Outfit;
  index: number;
  progress: MotionValue<number>;
  positions: OutfitPositions;
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

  const topSpring    = useSpring(topXRaw,    { stiffness: 120, damping: 24 });
  const bottomSpring = useSpring(bottomXRaw, { stiffness: 120, damping: 24 });

  const topXVw    = useTransform(topSpring,    (v) => `${v}vw`);
  const bottomXVw = useTransform(bottomSpring, (v) => `${v}vw`);

  const opacity = useTransform(
    progress,
    inputRange,
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]
  );

  const slotData = positions[outfit.positionKey];
  const topPos    = slotData?.top;
  const bottomPos = slotData?.bottom;

  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={outfit.bottom}
        alt=""
        aria-hidden
        style={{ x: bottomXVw, ...garmentStyle(bottomPos) }}
        className={bottomPos ? POSITIONED_IMG_CLASS : DEFAULT_IMG_CLASS}
        draggable={false}
        loading={first ? "eager" : "lazy"}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={outfit.top}
        alt={outfit.title}
        style={{ x: topXVw, ...garmentStyle(topPos) }}
        className={topPos ? POSITIONED_IMG_CLASS : DEFAULT_IMG_CLASS}
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

  const [positions, setPositions] = useState<OutfitPositions>({});

  useEffect(() => {
    fetch("/api/outfit-positions")
      .then((r) => r.json())
      .then((data: OutfitPositions) => {
        console.log("[OutfitShowcase] positions loaded:", JSON.stringify(data));
        setPositions(data);
      })
      .catch((err) => {
        console.error("[OutfitShowcase] failed to load positions:", err);
      });
  }, []);

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

        {/* Garment layers */}
        <div className="absolute inset-0 z-10">
          {OUTFITS.map((o, i) => (
            <GarmentLayers
              key={o.id}
              outfit={o}
              index={i}
              progress={scrollYProgress}
              positions={positions}
            />
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
