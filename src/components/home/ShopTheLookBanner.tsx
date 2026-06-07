import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function ShopTheLookBanner() {
  return (
    <section className="bg-ink py-16 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary-light">
            Shop The Look
          </p>
          <h2 className="mt-4 font-serif text-4xl font-bold">
            One image. Every piece. Tap to shop.
          </h2>
          <p className="mt-4 max-w-md text-white/75">
            Our interactive outfits let you tap any item directly on the photo to
            shop it instantly — or add the entire look to your bag and save with a
            bundle discount.
          </p>
          <Link href="/outfits" className="mt-8 inline-block">
            <Button size="lg">Explore Interactive Looks</Button>
          </Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80"
            alt="Shop the look"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <span className="absolute left-[30%] top-[40%] flex h-7 w-7 items-center justify-center">
            <span className="absolute h-7 w-7 rounded-full bg-primary/60 animate-pulseRing" />
            <span className="relative h-7 w-7 rounded-full border-2 border-white bg-primary" />
          </span>
          <span className="absolute left-[60%] top-[65%] flex h-7 w-7 items-center justify-center">
            <span className="absolute h-7 w-7 rounded-full bg-primary/60 animate-pulseRing" />
            <span className="relative h-7 w-7 rounded-full border-2 border-white bg-primary" />
          </span>
        </div>
      </div>
    </section>
  );
}
