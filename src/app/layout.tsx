import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

// TEMPORARY deploy-verification marker — safe to remove once the pending
// Railway deployment is confirmed live. Shows up in both the page <head>
// (view-source / inspect <meta name="build-marker">) and as a tiny corner
// label on every page, so a stale/failed deploy is obvious without guessing
// from layout differences alone.
const BUILD_MARKER = "DEPLOY-CHECK-2026-07-05T10:51:55Z";

export const metadata: Metadata = {
  title: {
    default: "LOKYO — Dress the Moment",
    template: "%s — LOKYO",
  },
  description:
    "LOKYO is a minimalist luxury fashion platform. Shop curated outfits and standout pieces. Dress the Moment.",
  keywords: ["fashion", "outfits", "luxury", "minimalist", "clothing", "LOKYO"],
  other: { "build-marker": BUILD_MARKER },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* TEMPORARY deploy-verification marker — remove alongside BUILD_MARKER above */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            bottom: 4,
            left: 4,
            zIndex: 9999,
            fontSize: 10,
            lineHeight: 1,
            color: "rgba(0,0,0,0.35)",
            background: "rgba(255,255,255,0.6)",
            padding: "2px 4px",
            borderRadius: 3,
            pointerEvents: "none",
            fontFamily: "monospace",
          }}
        >
          {BUILD_MARKER}
        </div>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
