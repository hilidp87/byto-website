"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import type { Style } from "@/types";

export function OutfitCard({ outfit }: { outfit: Style }) {
  return (
    <Link href={`/outfits/${outfit.slug}`}>
      <motion.div
        whileHover="hover"
        className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface"
      >
        <Image
          src={outfit.coverImage}
          alt={outfit.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <Badge variant="primary" className="absolute left-4 top-4">
          {outfit.category}
        </Badge>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h3 className="font-serif text-2xl font-semibold">{outfit.title}</h3>
          <motion.p
            variants={{ hover: { opacity: 1, y: 0 } }}
            initial={{ opacity: 0, y: 8 }}
            className="mt-1 text-sm text-white/80"
          >
            {outfit.items.length} pieces · Shop the look
          </motion.p>
        </div>
      </motion.div>
    </Link>
  );
}
