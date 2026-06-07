"use client";

import Image from "next/image";
import Link from "next/link";
import { TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import type { CartItem as CartItemType } from "@/types";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, remove } = useCart();

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/products/${item.slug}`}
        className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface"
      >
        <Image src={item.image} alt={item.title} fill className="object-cover" />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            className="text-sm font-medium text-ink hover:text-primary"
          >
            {item.title}
          </Link>
          <button
            onClick={() => remove(item.productId, item.size, item.color)}
            aria-label="Remove item"
            className="text-ink-muted hover:text-sale"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-0.5 text-xs text-ink-muted">
          {[item.color, item.size].filter(Boolean).join(" / ")}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-full border border-line">
            <button
              onClick={() =>
                updateQuantity(item.productId, item.quantity - 1, item.size, item.color)
              }
              aria-label="Decrease quantity"
              className="px-2 py-1.5"
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() =>
                updateQuantity(item.productId, item.quantity + 1, item.size, item.color)
              }
              aria-label="Increase quantity"
              className="px-2 py-1.5"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-sm font-semibold">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
