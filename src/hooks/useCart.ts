"use client";

import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";
import type { CartItem } from "@/types";

export function useCart() {
  const store = useCartStore();

  const add = (item: CartItem, notify = true) => {
    store.addItem(item);
    if (notify) toast.success(`${item.title} added to cart`);
  };

  return {
    items: store.items,
    isOpen: store.isOpen,
    open: store.open,
    close: store.close,
    toggle: store.toggle,
    add,
    remove: store.removeItem,
    updateQuantity: store.updateQuantity,
    clear: store.clear,
    subtotal: store.subtotal(),
    count: store.count(),
  };
}
