"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { XMarkIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "./CartItem";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, close, items, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="font-serif text-xl">Your Bag</h2>
              <button onClick={close} aria-label="Close cart" className="rounded-full p-1 hover:bg-surface">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center text-ink-muted">
                <ShoppingBagIcon className="h-12 w-12" />
                <p>Your bag is empty.</p>
                <Button variant="outline" onClick={close}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 divide-y divide-line overflow-y-auto px-5">
                  {items.map((item) => (
                    <CartItem
                      key={`${item.productId}-${item.size}-${item.color}`}
                      item={item}
                    />
                  ))}
                </div>
                <div className="space-y-4 border-t border-line p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-muted">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <Link href="/checkout" onClick={close} className="block">
                    <Button className="w-full">Proceed to Checkout</Button>
                  </Link>
                  <Link href="/cart" onClick={close} className="block">
                    <Button variant="ghost" className="w-full">
                      View Bag
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
