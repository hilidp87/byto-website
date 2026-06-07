import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { StyleItem } from "@/types";

export function OutfitItems({ items }: { items: StyleItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {items.map((item) => (
        <Link key={item.id} href={`/products/${item.product.slug}`} className="group">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface">
            <Image
              src={item.product.images[0]}
              alt={item.product.title}
              fill
              className="object-cover transition group-hover:scale-105"
            />
          </div>
          <p className="mt-1 truncate text-xs font-medium">{item.product.title}</p>
          <p className="text-xs text-ink-muted">{formatPrice(item.product.price)}</p>
        </Link>
      ))}
    </div>
  );
}
