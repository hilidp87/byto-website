"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      <div className="flex gap-3 lg:flex-col">
        {images.map((img, i) => (
          <button
            key={img}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-surface",
              active === i ? "border-primary" : "border-line"
            )}
          >
            <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
      <div
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-surface"
        onClick={() => setZoom((z) => !z)}
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className={cn(
            "object-cover transition-transform duration-300",
            zoom && "scale-150"
          )}
        />
      </div>
    </div>
  );
}
