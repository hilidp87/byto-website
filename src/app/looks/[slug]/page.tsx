import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LookHotspots from "@/components/look/LookHotspots";

export const revalidate = 60;

function formatToman(price: number): string {
  return `${price.toLocaleString("fa-IR")} تومان`;
}

async function getLook(id: string) {
  return prisma.look.findFirst({
    where: { id, active: true },
    include: { hotspots: { include: { product: true } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const look = await prisma.look.findUnique({ where: { id: slug } });
  if (!look) return { title: "لوک یافت نشد" };
  return { title: look.title, description: look.description || undefined };
}

export default async function LookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const look = await getLook(slug);
  if (!look) notFound();

  const products = look.hotspots.map((h) => h.product);

  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-4 py-12 text-right sm:px-6">
      <h1 className="mb-2 font-serif text-4xl font-bold">{look.title}</h1>
      {look.description && (
        <p className="mb-6 text-ink-muted">{look.description}</p>
      )}

      <LookHotspots
        lookId={look.id}
        image={look.image}
        title={look.title}
        hotspots={look.hotspots.map((h) => ({
          id: h.id,
          x: h.x,
          y: h.y,
          label: h.label,
          product: {
            slug: h.product.slug,
            title: h.product.title,
            price: h.product.price,
          },
        }))}
      />

      <section className="mt-12">
        <h2 className="mb-6 font-serif text-2xl font-bold">محصولات این لوک</h2>
        {products.length === 0 ? (
          <p className="text-ink-muted">محصولی به این لوک پیوند داده نشده است.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/300"}
                    alt={p.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium">{p.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{formatToman(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
