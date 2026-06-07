"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import toast from "react-hot-toast";
import type { Style } from "@/types";

export function ShopTheLook({ outfit }: { outfit: Style }) {
  const { add } = useCart();

  const total = outfit.items.reduce((sum, i) => sum + i.product.price, 0);
  const bundlePrice = total * (1 - outfit.bundleDiscount / 100);
  const savings = total - bundlePrice;

  const addItem = (idx: number) => {
    const { product } = outfit.items[idx];
    add({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images[0],
      price: product.price,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0],
    });
  };

  const addAll = () => {
    outfit.items.forEach((item) => {
      add(
        {
          productId: item.product.id,
          slug: item.product.slug,
          title: item.product.title,
          image: item.product.images[0],
          price: item.product.price,
          quantity: 1,
          size: item.product.sizes[0],
          color: item.product.colors[0],
        },
        false
      );
    });
    toast.success("Complete outfit added to cart");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="divide-y divide-line">
        <h2 className="pb-4 font-serif text-2xl font-semibold">Shop The Look</h2>
        {outfit.items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <Link
              href={`/products/${item.product.slug}`}
              className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface"
            >
              <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
            </Link>
            <div className="flex-1">
              <Link
                href={`/products/${item.product.slug}`}
                className="text-sm font-medium text-ink hover:text-primary"
              >
                {item.product.title}
              </Link>
              <p className="text-xs text-ink-muted">{item.product.category}</p>
              <p className="mt-1 text-sm font-semibold">{formatPrice(item.product.price)}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => addItem(idx)}>
              Add to Cart
            </Button>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-serif text-xl font-semibold">Bundle &amp; Save</h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-ink-muted">
            <span>Total Individual Price</span>
            <span className="line-through">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between font-semibold text-ink">
            <span>Bundle Price</span>
            <span>{formatPrice(bundlePrice)}</span>
          </div>
        </div>
        <Badge variant="sale" className="mt-3">
          Save {formatPrice(savings)} ({outfit.bundleDiscount}%)
        </Badge>
        <Button onClick={addAll} className="mt-5 w-full">
          Add Complete Outfit to Cart
        </Button>
      </div>
    </div>
  );
}
