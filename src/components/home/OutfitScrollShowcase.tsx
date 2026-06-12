"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

export type ShowcaseLook = {
  id: string;
  title: string;
  subtitle?: string;
  outfitImage: string;
  href: string;
};

const OUTFITS: ShowcaseLook[] = [
  {
    id: "1",
    title: "Campus Cool",
    subtitle: "White cardigan · crop tank · tailored shorts",
    outfitImage: "/outfits/outfit-1.png",
    href: "/looks",
  },
  {
    id: "2",
    title: "Denim Dream",
    subtitle: "Lace bralette · wide-leg baggy jeans",
    outfitImage: "/outfits/outfit-2.png",
    href: "/looks",
  },
  {
    id: "3",
    title: "Street Minimal",
    subtitle: "Black crop tee · wide-leg baggy jeans",
    outfitImage: "/outfits/outfit-3.png",
    href: "/looks",
  },
];

/** Outfit layer: model base + outfit clothes crossfade together */
function OutfitLayer({
  outfit,
  index,
  total,
  progress,
}: {
  outfit: ShowcaseLook;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const fadeDur = 0.08 / total;

  const opacity = useTransform(
    progress,
    index === 0
      ? [0, end - fadeDur, end]
      : index === total - 1
        ? [start, start + fadeDur, 1]
        : [start, start + fadeDur, end - fadeDur, end],
    index === 0
      ? [1, 1, 0]
      : index === total - 1
        ? [0, 1, 1]
        : [0, 1, 1, 0]
  );

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-0"
    >
      {/* Model base — full-size box, object-contain keeps it centered */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/outfits/model.png"
        alt=""
        className="absolute inset-0 h-full w-full select-none object-contain object-center"
        draggable={false}
        aria-hidden
      />
      {/* Outfit clothes — identical box, so it aligns perfectly over the model */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={outfit.outfitImage}
        alt={outfit.title}
        className="absolute inset-0 z-10 h-full w-full select-none object-contain object-center"
        draggable={false}
        loading={index === 0 ? "eager" : "lazy"}
      />
    </motion.div>
  );
}

/** Outfit label + CTA that swaps in sync */
function OutfitCaption({
  outfit,
  index,
  total,
  progress,
}: {
  outfit: ShowcaseLook;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const fadeDur = 0.08 / total;

  const opacity = useTransform(
    progress,
    index === 0
      ? [0, end - fadeDur, end]
      : index === total - 1
        ? [start, start + fadeDur, 1]
        : [start, start + fadeDur, end - fadeDur, end],
    index === 0
      ? [1, 1, 0]
      : index === total - 1
        ? [0, 1, 1]
        : [0, 1, 1, 0]
  );
  const y = useTransform(progress, [start, start + fadeDur], [20, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center gap-3 px-4 text-center"
    >
      <div>
        <p className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
          {outfit.title}
        </p>
        {outfit.subtitle && (
          <p className="mt-1 text-sm text-gray-500">{outfit.subtitle}</p>
        )}
      </div>
      <Link
        href={outfit.href}
        className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
      >
        Shop This Look <span aria-hidden>→</span>
      </Link>
    </motion.div>
  );
}

/** Scroll progress bar at the bottom */
function ScrollBar({ progress }: { progress: MotionValue<number> }) {
  const scaleX = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-black/10">
      <motion.div style={{ scaleX, originX: 0 }} className="h-full bg-gray-900" />
    </div>
  );
}

export function OutfitScrollShowcase() {
  const outfits = OUTFITS;
  const total = outfits.length;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Dot index driven by scroll
  const activeIndex = useTransform(scrollYProgress, [0, 0.999], [0, total - 1]);

  return (
    <section
      ref={containerRef}
      style={{ height: `${total * 100}vh` }}
      className="relative"
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 90% at 50% 60%, #f5c6ea 0%, #f0aadf 35%, #e879cf 70%, #d95ec0 100%)",
        }}
      >
        {/* Outfit layers — each one includes the model base + clothes */}
        <div className="absolute inset-0 z-10">
          {outfits.map((outfit, i) => (
            <OutfitLayer
              key={outfit.id}
              outfit={outfit}
              index={i}
              total={total}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* Captions */}
        {outfits.map((outfit, i) => (
          <OutfitCaption
            key={outfit.id}
            outfit={outfit}
            index={i}
            total={total}
            progress={scrollYProgress}
          />
        ))}

        {/* Dot navigation (right side) */}
        <div className="absolute right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2.5">
          {outfits.map((_, i) => (
            <DotIndicator
              key={i}
              index={i}
              total={total}
              progress={scrollYProgress}
              activeIndex={activeIndex}
            />
          ))}
        </div>

        {/* Look counter (top-left) */}
        <LookCounter total={total} progress={scrollYProgress} outfits={outfits} />

        {/* Scroll progress bar */}
        <ScrollBar progress={scrollYProgress} />

        {/* Scroll hint (only at very top) */}
        <ScrollHint progress={scrollYProgress} />
      </div>
    </section>
  );
}

function DotIndicator({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  activeIndex: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const size = useTransform(progress, [start, start + 0.05 / total, end - 0.05 / total, end], [8, 12, 12, 8]);
  const opacity = useTransform(progress, [start, start + 0.05 / total, end - 0.05 / total, end], [0.3, 1, 1, 0.3]);

  return (
    <motion.span
      style={{
        width: size,
        height: size,
        opacity,
      }}
      className="rounded-full bg-gray-900 transition-all"
    />
  );
}

function CounterItem({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const fadeDur = 0.08 / total;
  const opacity = useTransform(
    progress,
    index === 0
      ? [0, end - fadeDur, end]
      : index === total - 1
        ? [start, start + fadeDur, 1]
        : [start, start + fadeDur, end - fadeDur, end],
    index === 0
      ? [1, 1, 0]
      : index === total - 1
        ? [0, 1, 1]
        : [0, 1, 1, 0]
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

function LookCounter({
  total,
  progress,
  outfits,
}: {
  total: number;
  progress: MotionValue<number>;
  outfits: ShowcaseLook[];
}) {
  return (
    <div className="absolute left-5 top-6 z-30 space-y-0.5">
      {outfits.map((_, i) => (
        <CounterItem key={i} index={i} total={total} progress={progress} />
      ))}
    </div>
  );
}

function ScrollHint({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.06], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-1.5"
    >
      <span className="text-xs uppercase tracking-[0.3em] text-gray-600">Scroll</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        className="h-5 w-px bg-gray-600"
      />
    </motion.div>
  );
}
