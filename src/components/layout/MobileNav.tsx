"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
}

export function MobileNav({ open, onClose, links }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.nav
            className="fixed left-0 top-0 z-50 h-full w-72 bg-white p-6 shadow-xl md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-2xl font-bold">LOKYO</span>
              <button onClick={onClose} aria-label="Close menu">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="rounded-lg px-3 py-3 text-lg font-medium text-ink hover:bg-surface"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/wishlist"
                onClick={onClose}
                className="rounded-lg px-3 py-3 text-lg font-medium text-ink hover:bg-surface"
              >
                Wishlist
              </Link>
              <Link
                href="/profile"
                onClick={onClose}
                className="rounded-lg px-3 py-3 text-lg font-medium text-ink hover:bg-surface"
              >
                Account
              </Link>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
