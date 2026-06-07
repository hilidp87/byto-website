"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductActions({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [color, setColor] = useState<string | undefined>(product.colors[0]);
  const [size, setSize] = useState<string | undefined>(product.sizes[0]);
  const saved = has(product.id);

  const handleAdd = () => {
    add({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images[0],
      price: product.price,
      quantity: 1,
      size,
      color,
    });
  };

  return (
    <div className="space-y-6">
      {product.colors.length > 0 && (
        <div>
          <p className="text-sm font-medium">Color: <span className="text-ink-muted">{color}</span></p>
          <div className="mt-2 flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs",
                  color === c ? "border-primary bg-primary-light" : "border-line hover:border-ink"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "min-w-11 rounded-lg border px-3 py-2 text-sm",
                  size === s ? "border-primary bg-primary-light" : "border-line hover:border-ink"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <motion.div whileTap={{ scale: 0.96 }} className="flex-1">
          <Button onClick={handleAdd} className="w-full" size="lg" disabled={product.stock <= 0}>
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </motion.div>
        <Button
          variant="outline"
          size="lg"
          aria-label="Toggle wishlist"
          onClick={() =>
            toggle({
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: product.images[0],
              price: product.price,
            })
          }
        >
          {saved ? <HeartSolid className="h-5 w-5 text-sale" /> : <HeartIcon className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
