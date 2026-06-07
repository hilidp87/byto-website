"use client";

import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-bold">Wishlist</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ink-muted">You have no saved items yet.</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button>Discover Products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.productId} className="group relative">
              <Link href={`/products/${item.slug}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
              </Link>
              <button
                onClick={() => remove(item.productId)}
                aria-label="Remove"
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm hover:text-sale"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              <h3 className="mt-3 text-sm font-medium">{item.title}</h3>
              <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() =>
                  add({
                    productId: item.productId,
                    slug: item.slug,
                    title: item.title,
                    image: item.image,
                    price: item.price,
                    quantity: 1,
                  })
                }
              >
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
