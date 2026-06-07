"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_FLAT, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const handlePay = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to complete your order");
      router.push("/login");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            size: i.size,
            color: i.color,
          })),
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      const data = await res.json();
      clear();
      router.push(data.redirectUrl || `/checkout/success?orderId=${data.orderId}`);
    } catch {
      toast.error("Could not process your order");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-3xl font-bold">Nothing to check out</h1>
        <p className="mt-2 text-ink-muted">Your bag is empty.</p>
        <Link href="/products" className="mt-6 inline-block">
          <Button>Shop Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-bold">Checkout</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section>
            <h2 className="font-serif text-xl font-semibold">Shipping Details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <input placeholder="First name" className="h-12 rounded-lg border border-line px-4 text-sm outline-none focus:border-primary" />
              <input placeholder="Last name" className="h-12 rounded-lg border border-line px-4 text-sm outline-none focus:border-primary" />
              <input placeholder="Address" className="col-span-2 h-12 rounded-lg border border-line px-4 text-sm outline-none focus:border-primary" />
              <input placeholder="City" className="h-12 rounded-lg border border-line px-4 text-sm outline-none focus:border-primary" />
              <input placeholder="Postal code" className="h-12 rounded-lg border border-line px-4 text-sm outline-none focus:border-primary" />
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold">Payment</h2>
            <p className="mt-2 text-sm text-ink-muted">
              This demo uses a mock payment provider. No real charge is made.
            </p>
          </section>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-serif text-xl font-semibold">Order Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}-${i.color}`} className="flex justify-between">
                <span className="text-ink-muted">
                  {i.title} × {i.quantity}
                </span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
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
          <Button
            className="mt-6 w-full"
            onClick={handlePay}
            disabled={submitting || isLoading}
          >
            {submitting ? "Processing…" : "Pay & Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
