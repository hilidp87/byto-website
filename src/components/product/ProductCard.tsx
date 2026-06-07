"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, calcDiscount } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  const discount = calcDiscount(product.price, product.comparePrice);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {discount && (
            <Badge variant="sale" className="absolute left-3 top-3">
              -{discount}%
            </Badge>
          )}
        </div>
      </Link>
      <button
        aria-label="Toggle wishlist"
        onClick={(e) => {
          e.preventDefault();
          toggle({
            productId: product.id,
            slug: product.slug,
            title: product.title,
            image: product.images[0],
            price: product.price,
          });
        }}
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm transition hover:scale-110"
      >
        {saved ? (
          <HeartSolid className="h-4 w-4 text-sale" />
        ) : (
          <HeartIcon className="h-4 w-4 text-ink" />
        )}
      </button>
      <div className="mt-3">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-ink-muted">{product.brand}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-0.5 text-sm font-medium text-ink hover:text-primary">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-ink-muted line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
