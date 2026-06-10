"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bars3Icon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="hidden lg:block" />

      <button
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        <ArrowRightOnRectangleIcon className="h-4 w-4" />
        {loading ? "Logging out…" : "Logout"}
      </button>
    </header>
  );
}
