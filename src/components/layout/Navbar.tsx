"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useAuth } from "@/hooks/useAuth";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/outfits", label: "Outfits" },
  { href: "/products", label: "Products" },
  { href: "/#about", label: "About" },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleCart = useCartStore((s) => s.toggle);
  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const wishCount = useWishlistStore((s) => s.items.length);
  const { isAuthenticated } = useAuth();

  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-ink">
              LOKYO
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-ink transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/products" aria-label="Search" className="hidden sm:block">
              <MagnifyingGlassIcon className="h-5 w-5 text-ink hover:text-primary" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="relative">
              <HeartIcon className="h-5 w-5 text-ink hover:text-primary" />
              {mounted && <CountBadge count={wishCount} />}
            </Link>
            <button onClick={toggleCart} aria-label="Cart" className="relative">
              <ShoppingBagIcon className="h-5 w-5 text-ink hover:text-primary" />
              {mounted && <CountBadge count={cartCount} />}
            </button>
            <Link
              href={isAuthenticated ? "/profile" : "/login"}
              aria-label="Account"
              className={cn(
                "rounded-full p-1",
                isAuthenticated && "bg-primary-light"
              )}
            >
              <UserIcon className="h-5 w-5 text-ink hover:text-primary" />
            </Link>
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} />
    </>
  );
}
