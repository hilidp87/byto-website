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
  /** garment cutout images shown sliding beside the model */
  garments: string[];
};

const FALLBACK_LOOKS: ShowcaseLook[] = [
  {
    id: "f1",
    title: "Street Casual",
    description: "Effortless layers for the everyday city pace.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
    href: "/outfits",
    garments: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    ],
  },
  {
    id: "f2",
    title: "Smart Office",
    description: "Tailored lines that move from meeting to evening.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
    href: "/outfits",
    garments: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80",
    ],
  },
  {
    id: "f3",
    title: "Weekend Edit",
    description: "Soft textures and easy fits, built for slow days.",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&q=80",
    href: "/outfits",
    garments: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80",
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400&q=80",
    ],
  },
];

/** Center model image: crossfades between looks at slice boundaries */
function CenterModel({
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
  const sliceStart = index / total;
  const sliceEnd = (index + 1) / total;
  const fade = 0.1 / total;

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

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex items-end justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={look.image}
        alt={look.title}
        className="h-[78vh] w-auto select-none object-contain drop-shadow-2xl"
        draggable={false}
      />
    </motion.div>
  );
}

/** Caption (title + CTA) synced to active look */
function Caption({
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
  const sliceStart = index / total;
  const sliceEnd = (index + 1) / total;
  const fade = 0.1 / total;

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
  const y = useTransform(progress, [sliceStart, sliceStart + fade], [16, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute bottom-8 left-1/2 z-20 w-full max-w-md -translate-x-1/2 text-center"
    >
      <h3 className="font-serif text-2xl font-bold text-ink sm:text-3xl">{look.title}</h3>
      <Link
        href={look.href}
        className="pointer-events-auto mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/80"
      >
        Shop This Look <span aria-hidden>→</span>
      </Link>
    </motion.div>
  );
}

export function OutfitScrollShowcase({ looks }: { looks?: ShowcaseLook[] }) {
  const data = looks && looks.length >= 2 ? looks.slice(0, 5) : FALLBACK_LOOKS;
  const total = data.length;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Garment strip: one slot pair (left + right of the model) per look.
  // The whole strip slides left as you scroll, so garments glide past the model
  // exactly when her outfit changes.
  const stripX = useTransform(
    scrollYProgress,
    [0, 1],
    ["0vw", `-${(total - 1) * 100}vw`]
  );

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
            "radial-gradient(ellipse at center, #f6d5f0 0%, #f0aee4 45%, #e879d8 100%)",
        }}
      >
        {/* sliding garment strip (behind the model) */}
        <motion.div
          style={{ x: stripX }}
          className="absolute inset-y-0 left-0 z-0 flex"
        >
          {data.map((look) => (
            <div
              key={look.id}
              className="flex h-full w-screen shrink-0 items-center justify-between px-[6vw]"
            >
              {/* left garment */}
              <div className="hidden w-[22vw] max-w-xs sm:block">
                {look.garments[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={look.garments[0]}
                    alt=""
                    className="max-h-[55vh] w-full select-none object-contain drop-shadow-xl"
                    draggable={false}
                  />
                )}
              </div>
              {/* center gap where the model stands */}
              <div className="w-[28vw]" />
              {/* right garment */}
              <div className="hidden w-[22vw] max-w-xs sm:block">
                {look.garments[1] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={look.garments[1]}
                    alt=""
                    className="max-h-[55vh] w-full select-none object-contain drop-shadow-xl"
                    draggable={false}
                  />
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* fixed center model, crossfading between looks */}
        <div className="absolute inset-0 z-10">
          {data.map((look, i) => (
            <CenterModel
              key={look.id}
              look={look}
              index={i}
              total={total}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* captions */}
        {data.map((look, i) => (
          <Caption
            key={look.id}
            look={look}
            index={i}
            total={total}
            progress={scrollYProgress}
          />
        ))}

        {/* scroll hint */}
        <div className="absolute right-6 top-1/2 z-20 -translate-y-1/2 rotate-90 text-[11px] uppercase tracking-[0.3em] text-ink/50">
          Scroll
        </div>
      </div>
    </section>
  );
}
