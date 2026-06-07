"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
        alt="LOKYO fashion editorial"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/30 to-primary/30" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6"
      >
        <motion.p variants={item} className="text-sm font-medium uppercase tracking-[0.3em] text-primary-light">
          LOKYO
        </motion.p>
        <motion.h1 variants={item} className="mt-4 max-w-2xl font-serif text-5xl font-bold leading-tight text-white sm:text-7xl">
          Dress the Moment
        </motion.h1>
        <motion.p variants={item} className="mt-5 max-w-md text-lg text-white/85">
          Curated outfits and standout pieces for a life worth dressing up for.
          Minimalist luxury, made effortless.
        </motion.p>
        <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
          <Link href="/outfits">
            <Button size="lg">Explore Looks</Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/40 hover:bg-white/20">
              Shop Products
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
