"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ArrowLeftIcon,
  PhotoIcon,
  RectangleGroupIcon,
  ChartBarIcon,
  SwatchIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/products", label: "Products", icon: ShoppingBagIcon },
  { href: "/admin/orders", label: "Orders", icon: ClipboardDocumentListIcon },
  { href: "/admin/customers", label: "Customers", icon: UsersIcon },
  { href: "/admin/looks", label: "لوک‌ها", icon: PhotoIcon },
  { href: "/admin/styles", label: "Styles Editor", icon: SwatchIcon },
  { href: "/admin/outfit-config", label: "Try-On Editor", icon: SparklesIcon },
  { href: "/admin/content", label: "مدیریت محتوا", icon: RectangleGroupIcon },
  { href: "/admin/analytics", label: "آمار و تحلیل", icon: ChartBarIcon },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#1A1A2E] text-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6">
          <Link href="/admin/dashboard" className="text-xl font-bold tracking-wide">
            LOKYO
            <span className="ml-1 text-xs font-normal text-sky-400">admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sky-500 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          <div className="my-3 border-t border-white/10" />

          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Store
          </Link>
        </nav>
      </aside>
    </>
  );
}
