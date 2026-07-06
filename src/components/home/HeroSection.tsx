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
        src="/images/hero-new.jpg"
        alt="LOKYO fashion editorial"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="absolute bottom-[8%] left-1/2 z-10 w-full max-w-2xl -translate-x-1/2 px-4 text-center sm:px-6"
      >
        <motion.p variants={item} className="text-sm font-medium uppercase tracking-[0.3em] text-primary-light">
          LOKYO
        </motion.p>
        <motion.h1 variants={item} className="mt-4 font-serif text-4xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
          Look Like You
        </motion.h1>
        <motion.p variants={item} className="mx-auto mt-5 max-w-md text-base text-white/85 sm:text-lg">
          Curated outfits and standout pieces for a life worth dressing up for.
          Minimalist luxury, made effortless.
        </motion.p>
        <motion.div variants={item} className="mt-8 flex flex-wrap justify-center gap-4">
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
