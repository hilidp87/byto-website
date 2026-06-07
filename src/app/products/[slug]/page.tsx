import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { Badge } from "@/components/ui/Badge";
import { OutfitCard } from "@/components/outfit/OutfitCard";
import { formatPrice, calcDiscount } from "@/lib/utils";
import type { Product, Style } from "@/types";

export const revalidate = 60;

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { styleItems: { include: { style: { include: { items: { include: { product: true } } } } } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const discount = calcDiscount(product.price, product.comparePrice);
  const outfits = product.styleItems.map((si) => si.style);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2">
        <ImageGallery images={product.images} alt={product.title} />

        <div>
          {product.brand && (
            <p className="text-sm uppercase tracking-wide text-ink-muted">{product.brand}</p>
          )}
          <h1 className="mt-1 font-serif text-4xl font-bold">{product.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-lg text-ink-muted line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            {discount && <Badge variant="sale">-{discount}%</Badge>}
          </div>

          <p className="mt-6 leading-relaxed text-ink-muted">{product.description}</p>

          {product.material && (
            <p className="mt-3 text-sm text-ink-muted">
              <span className="font-medium text-ink">Material:</span> {product.material}
            </p>
          )}

          <div className="mt-8">
            <ProductActions product={product as unknown as Product} />
          </div>

          <p className="mt-4 text-xs text-ink-muted">
            {product.stock > 0 ? `${product.stock} in stock` : "Currently out of stock"} · Free returns within 30 days
          </p>
        </div>
      </div>

      {outfits.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-serif text-3xl font-bold">Used In These Outfits</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {outfits.map((o) => (
              <OutfitCard key={o.id} outfit={o as unknown as Style} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <Link href="/products" className="text-sm font-medium text-primary hover:underline">
          ← Back to all products
        </Link>
      </div>
    </div>
  );
}
