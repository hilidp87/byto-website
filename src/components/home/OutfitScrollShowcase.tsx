"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

export type ShowcaseLook = {
  id: string;
  title: string;
  description: string | null;
  image: string;
  href: string;
};

const FALLBACK_LOOKS: ShowcaseLook[] = [
  {
    id: "f1",
    title: "Street Casual",
    description: "Effortless layers for the everyday city pace.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
    href: "/outfits",
  },
  {
    id: "f2",
    title: "Smart Office",
    description: "Tailored lines that move from meeting to evening.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
    href: "/outfits",
  },
  {
    id: "f3",
    title: "Weekend Edit",
    description: "Soft textures and easy fits, built for slow days.",
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&q=80",
    href: "/outfits",
  },
];

function ShowcaseFrame({
  look,
  index,
  total,
  progress,
}: {
  look: ShowcaseLook;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Each look owns an equal slice of the scroll progress; crossfade at slice edges
  const sliceStart = index / total;
  const sliceEnd = (index + 1) / total;
  const fade = 0.12 / total;

  const opacity = useTransform(
    progress,
    index === 0
      ? [0, sliceEnd - fade, sliceEnd]
      : index === total - 1
        ? [sliceStart, sliceStart + fade, 1]
        : [sliceStart, sliceStart + fade, sliceEnd - fade, sliceEnd],
    index === 0
      ? [1, 1, 0]
      : index === total - 1
        ? [0, 1, 1]
        : [0, 1, 1, 0]
  );

  const imageScale = useTransform(
    progress,
    [sliceStart, sliceEnd],
    [1.08, 1]
  );

  const textY = useTransform(progress, [sliceStart, sliceStart + fade], [40, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex items-center"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
        {/* Text */}
        <motion.div style={{ y: textY }} className="order-2 md:order-1">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-primary">
            Look {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <h3 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {look.title}
          </h3>
          {look.description && (
            <p className="mt-4 max-w-md text-lg text-ink-muted">{look.description}</p>
          )}
          <Link
            href={look.href}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white transition hover:bg-ink/80"
          >
            Shop This Look
            <span aria-hidden>→</span>
          </Link>
        </motion.div>

        {/* Image */}
        <div className="order-1 md:order-2">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-3xl shadow-2xl">
            <motion.img
              src={look.image}
              alt={look.title}
              style={{ scale: imageScale }}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function OutfitScrollShowcase({ looks }: { looks?: ShowcaseLook[] }) {
  const data = looks && looks.length >= 2 ? looks.slice(0, 5) : FALLBACK_LOOKS;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} style={{ height: `${data.length * 100}vh` }} className="relative bg-[#faf8f5]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="relative h-full w-full">
          {data.map((look, i) => (
            <ShowcaseFrame
              key={look.id}
              look={look}
              index={i}
              total={data.length}
              progress={scrollYProgress}
            />
          ))}

          {/* Progress dots */}
          <div className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 md:flex">
            {data.map((look, i) => (
              <ProgressDot key={look.id} index={i} total={data.length} progress={scrollYProgress} />
            ))}
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.25em] text-ink-muted">
            Scroll to change outfit
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressDot({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const sliceStart = index / total;
  const sliceEnd = (index + 1) / total;
  const scale = useTransform(
    progress,
    [sliceStart - 0.05, sliceStart, sliceEnd, sliceEnd + 0.05],
    [1, 1.6, 1.6, 1]
  );
  const opacity = useTransform(
    progress,
    [sliceStart - 0.05, sliceStart, sliceEnd, sliceEnd + 0.05],
    [0.3, 1, 1, 0.3]
  );
  return (
    <motion.span
      style={{ scale, opacity }}
      className="h-2 w-2 rounded-full bg-ink"
    />
  );
}
