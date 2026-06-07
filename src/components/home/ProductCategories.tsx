import Image from "next/image";
import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export function ProductCategories() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">Shop by Category</h2>
          <p className="mt-2 text-ink-muted">Browse our full range of pieces.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PRODUCT_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative flex aspect-[5/3] items-center justify-center overflow-hidden rounded-xl"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/35 transition group-hover:bg-ink/50" />
              <span className="relative font-serif text-lg font-semibold text-white">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
