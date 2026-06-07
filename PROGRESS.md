# LOKYO — Fashion E-Commerce Platform

**Build Status:** In Progress (background agent actively writing files)
**Branch:** `claude/great-clarke-st0YC`
**Last Updated:** 2026-06-07

---

## What Has Been Built

### Infrastructure & Config
- `package.json` — Next.js 14, TypeScript, Tailwind CSS, Prisma, NextAuth, Framer Motion, Zustand, react-hot-toast, bcryptjs, @heroicons/react
- `tsconfig.json` — strict TypeScript config
- `tailwind.config.ts` — custom LOKYO color palette (sky-blue primary, white bg, Playfair Display + Inter fonts)
- `postcss.config.js`
- `next.config.js` — Unsplash image domain whitelisted
- `.env.example` — DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PAYMENT_PROVIDER
- `.gitignore`
- `next-env.d.ts`

### Database (Prisma)
- `prisma/schema.prisma` — full schema with models:
  - `User` (id, name, email, password, image)
  - `Account` + `Session` (NextAuth adapter)
  - `Product` (id, slug, title, description, price, comparePrice, images[], colors[], sizes[], stock, category, brand, material)
  - `Style` (id, slug, title, category, description, coverImage, bundleDiscount, season, occasion)
  - `StyleItem` (styleId, productId, hotspotX, hotspotY) — links outfits to products with hotspot coordinates
  - `Order` + `OrderItem`
  - `Payment` (provider, status, amount, reference — abstraction layer ready)
  - `WishlistItem`

### Library / Core
- `src/lib/prisma.ts` — Prisma client singleton
- `src/lib/auth.ts` — NextAuth config (Google OAuth + credentials provider with bcrypt)
- `src/lib/utils.ts` — utility helpers (cn, formatPrice, etc.)
- `src/lib/constants.ts` — outfit categories, product categories, brand constants
- `src/lib/payment/types.ts` — `PaymentProvider` interface (initiate/verify)
- `src/lib/payment/mock.ts` — `MockPaymentProvider` implementation
- `src/lib/payment/index.ts` — factory pattern, swappable via `PAYMENT_PROVIDER` env var

### State Management
- `src/store/cart.ts` — Zustand cart store (persisted to localStorage)
- `src/store/wishlist.ts` — Zustand wishlist store

### Hooks
- `src/hooks/useCart.ts`
- `src/hooks/useWishlist.ts`
- `src/hooks/useAuth.ts`

### Types
- `src/types/index.ts` — TypeScript interfaces for Product, Style, StyleItem, User, Order, CartItem etc.

### UI Components (`src/components/ui/`)
- `Button.tsx` — variants: primary, secondary, ghost, danger; sizes: sm, md, lg
- `Badge.tsx` — sale, new, category badges
- `Card.tsx` — base card wrapper
- `Modal.tsx` — accessible modal with backdrop
- `Skeleton.tsx` — loading skeleton for cards

### Layout Components (`src/components/layout/`)
- `Navbar.tsx` — Logo (LOKYO), nav links (Outfits, Products), search, wishlist count badge, cart count badge, user avatar/login
- `Footer.tsx` — logo, nav links, social icons, newsletter signup
- `MobileNav.tsx` — hamburger drawer for mobile

### Home Section Components (`src/components/home/`)
- `HeroSection.tsx` — full-width hero, sky-blue gradient overlay, Playfair Display headline "Dress the Moment", two CTAs, Framer Motion stagger animation
- `OutfitCategories.tsx` — 14 category cards (Casual, Workwear, Party, University, Gym, Outdoor, Summer, Winter, Formal, Streetwear, Smart Casual, Minimalist, Luxury, Travel), horizontal scroll on mobile, hover overlay slide-up
- `FeaturedOutfits.tsx` — 3-col grid of outfit cards
- `ProductCategories.tsx` — 13 product category tiles (Pants, Jeans, T-Shirts, Shirts, Hoodies, Jackets, Sneakers, Boots, Accessories, Watches, Bags, Hats, Sunglasses)

### Outfit Components (`src/components/outfit/`)
- `OutfitCard.tsx` — card with image, category badge, title, bundle price, hover effect
- `OutfitHotspot.tsx` — interactive hotspot system: pulsing sky-blue dots positioned at (hotspotX%, hotspotY%) over outfit image, hover tooltip (product name + price), click navigates to product page, mobile tap support
- `OutfitItems.tsx` — list of items in outfit with thumbnails
- `ShopTheLook.tsx` — full outfit breakdown: item list, total individual price, bundle price, savings badge, "Add Complete Outfit to Cart" CTA + per-item "Add to Cart"

### Product Components (`src/components/product/`)
- `ProductCard.tsx` — image, title, price, comparePrice strikethrough, wishlist icon, add to cart, discount badge, hover scale animation
- `ProductGrid.tsx` — responsive grid layout
- `ProductFilters.tsx` — sidebar filters (category, color, size, price range, availability)
- `ImageGallery.tsx` — multi-image gallery with zoom on hover
- `ProductActions.tsx` — size selector, color swatches, add to cart, add to wishlist

### Cart Components (`src/components/cart/`)
- `CartDrawer.tsx` — slides in from right, lists items, subtotal, "Proceed to Checkout" CTA
- `CartItem.tsx` — item row with image, name, size, color, quantity controls, remove button

### App Providers
- `src/components/Providers.tsx` — wraps SessionProvider (NextAuth) + Toaster (react-hot-toast)

### App Layout
- `src/app/globals.css` — Google Fonts import (Playfair Display + Inter), Tailwind base, custom CSS variables
- `src/app/layout.tsx` — root layout with fonts, metadata, Providers wrapper

---

## Still Being Built (Agent In Progress)

The background agent is still writing the following:

### Pages (all under `src/app/`)
- [ ] `page.tsx` — Homepage (Hero + OutfitCategories + FeaturedOutfits + ProductCategories + TrendingProducts + ShopTheLook banner + Footer)
- [ ] `outfits/page.tsx` — All outfits with filters (style type, season, occasion, color palette, price range)
- [ ] `outfits/[slug]/page.tsx` — Outfit detail: hotspot image, ShopTheLook, related outfits
- [ ] `products/page.tsx` — All products with sidebar filters
- [ ] `products/[slug]/page.tsx` — Product detail: ImageGallery, ProductActions, "Used In These Outfits" section
- [ ] `cart/page.tsx` — Cart page
- [ ] `checkout/page.tsx` — Checkout flow with mock payment
- [ ] `checkout/success/page.tsx` — Order confirmation
- [ ] `wishlist/page.tsx` — Saved products
- [ ] `profile/page.tsx` — User info + order history
- [ ] `(auth)/login/page.tsx` — Login form (email/password + Google OAuth)
- [ ] `(auth)/register/page.tsx` — Registration form

### API Routes
- [ ] `api/auth/[...nextauth]/route.ts`
- [ ] `api/cart/route.ts`
- [ ] `api/wishlist/route.ts`
- [ ] `api/orders/route.ts`

### Seed Data (`prisma/seed.ts`)
- [ ] 20+ products with Unsplash fashion photo URLs, realistic names and prices
- [ ] 6+ outfits (Weekend Casual, Business Refined, Street Edge, Smart Evening, Campus Cool, Minimalist Monday)
- [ ] StyleItem hotspot coordinates per outfit
- [ ] Product-to-outfit relationships

---

## Design System

| Token | Value |
|---|---|
| Primary | `#0EA5E9` (sky-500) |
| Light accent | `#BAE6FD` (sky-200) |
| Background | `#FFFFFF` |
| Surface | `#F8FAFC` (slate-50) |
| Text primary | `#0F172A` (slate-900) |
| Text secondary | `#64748B` (slate-500) |
| Border | `#E2E8F0` (slate-200) |
| Sale/Danger | `#EF4444` |
| Heading font | Playfair Display (serif) |
| Body font | Inter (sans-serif) |

---

## Architecture Decisions

### Payment Abstraction
The payment layer uses a provider interface pattern. Currently uses `MockPaymentProvider`. To add Zarinpal or Saman later:
1. Create `src/lib/payment/zarinpal.ts` implementing `PaymentProvider`
2. Register in `src/lib/payment/index.ts`
3. Set `PAYMENT_PROVIDER=zarinpal` in environment

No changes needed to checkout flow or order logic.

### Outfit Hotspot System
Hotspot coordinates are stored as `hotspotX` / `hotspotY` floats (0–100, percentage of image dimensions) in the `StyleItem` table. The `OutfitHotspot` component positions dots using `left: X%` / `top: Y%` absolute positioning over the image container. This works at any image size/resolution.

### Cart & Wishlist
Both are client-side Zustand stores persisted to `localStorage`. When user is authenticated, cart/wishlist can be synced to the database via API routes for cross-device persistence.

---

## Next Steps After Build Completes

1. Run `npm install` in the project root
2. Set up PostgreSQL and configure `DATABASE_URL`
3. Run `npx prisma migrate dev --name init`
4. Run `npx prisma db seed` to populate realistic data
5. Set up Google OAuth credentials in Google Cloud Console
6. Set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
7. Run `npm run dev` — site available at `http://localhost:3000`

---

## File Count Summary

| Area | Files Built |
|---|---|
| Config & Infrastructure | 9 |
| Prisma Schema | 1 |
| Library / Core | 7 |
| State (Zustand) | 2 |
| Hooks | 3 |
| Types | 1 |
| UI Components | 5 |
| Layout Components | 3 |
| Home Components | 4 |
| Outfit Components | 4 |
| Product Components | 5 |
| Cart Components | 2 |
| App Shell | 2 |
| **Total so far** | **~48** |
| **Remaining (pages + API + seed)** | **~15** |
