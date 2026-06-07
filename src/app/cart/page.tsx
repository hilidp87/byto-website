"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_FLAT, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function CartPage() {
  const { items, subtotal } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-bold">Your Bag</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ink-muted">Your bag is empty.</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button>Shop Products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-line">
            {items.map((item) => (
              <CartItem key={`${item.productId}-${item.size}-${item.color}`} item={item} />
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-serif text-xl font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-6 block">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
