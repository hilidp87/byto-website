import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "LOKYO — Dress the Moment",
    template: "%s — LOKYO",
  },
  description:
    "LOKYO is a minimalist luxury fashion platform. Shop curated outfits and standout pieces. Dress the Moment.",
  keywords: ["fashion", "outfits", "luxury", "minimalist", "clothing", "LOKYO"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
