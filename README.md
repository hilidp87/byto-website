# LOKYO — Dress the Moment

A production-grade fashion e-commerce platform built with Next.js 14 (App Router),
TypeScript, Tailwind CSS, Prisma + PostgreSQL, NextAuth, Zustand and Framer Motion.

## Features

- Minimalist luxury design system (sky-blue accents, Playfair Display + Inter)
- Interactive "Shop The Look" outfits with image hotspots and bundle pricing
- Full product catalog with filtering, sorting and detail pages
- Cart (Zustand + localStorage) with slide-in drawer and dedicated cart page
- Wishlist, checkout with pluggable payment provider (mock), and order history
- Auth via Google OAuth and email/password (bcrypt)
- Framer Motion animations that respect `prefers-reduced-motion`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables and fill in values:
   ```bash
   cp .env.example .env
   ```
   Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
   Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `PAYMENT_PROVIDER` (defaults to `mock`).
3. Push the schema and seed data:
   ```bash
   npm run db:push
   npm run db:seed
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

Demo account after seeding: `demo@lokyo.com` / `password123`.

## Payment Providers

Payment is abstracted behind a `PaymentProvider` interface (`src/lib/payment/`).
Swap implementations via the `PAYMENT_PROVIDER` env var. A `MockPaymentProvider`
ships by default; register additional providers in `src/lib/payment/index.ts`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — generate Prisma client and build for production
- `npm run db:push` — sync the Prisma schema to the database
- `npm run db:seed` — seed products, outfits and a demo user
