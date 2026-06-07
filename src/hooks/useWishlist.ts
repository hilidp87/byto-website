"use client";

import { useWishlistStore } from "@/store/wishlist";
import toast from "react-hot-toast";
import type { WishlistEntry } from "@/types";

export function useWishlist() {
  const store = useWishlistStore();

  const toggle = (item: WishlistEntry) => {
    const had = store.has(item.productId);
    store.toggle(item);
    toast.success(had ? "Removed from wishlist" : "Saved to wishlist");
  };

  return {
    items: store.items,
    toggle,
    remove: store.remove,
    has: store.has,
    count: store.count(),
  };
}
