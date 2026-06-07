import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistEntry } from "@/types";

interface WishlistState {
  items: WishlistEntry[];
  toggle: (item: WishlistEntry) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, item],
          };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      has: (productId) => get().items.some((i) => i.productId === productId),
      count: () => get().items.length,
    }),
    { name: "lokyo-wishlist" }
  )
);
