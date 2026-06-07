"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { OUTFIT_CATEGORIES } from "@/lib/constants";

export function OutfitCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8">
        <h2 className="font-serif text-3xl font-bold sm:text-4xl">Shop by Occasion</h2>
        <p className="mt-2 text-ink-muted">Find the right look for every moment.</p>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-7 md:overflow-visible">
        {OUTFIT_CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={`/outfits?category=${encodeURIComponent(cat.name)}`}
            className="group relative aspect-[3/4] w-32 flex-shrink-0 overflow-hidden rounded-xl md:w-auto"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-ink/30 transition group-hover:bg-ink/45" />
            <motion.span
              className="absolute inset-x-0 bottom-0 p-3 text-sm font-medium text-white"
              initial={{ y: 0 }}
              whileHover={{ y: -2 }}
            >
              {cat.name}
            </motion.span>
          </Link>
        ))}
      </div>
    </section>
  );
}
