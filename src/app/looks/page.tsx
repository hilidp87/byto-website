import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "لوک‌ها",
};

export const revalidate = 60;

export default async function LooksPage() {
  const looks = await prisma.look.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div dir="rtl" className="mx-auto max-w-7xl px-4 py-12 text-right sm:px-6">
      <h1 className="mb-8 font-serif text-4xl font-bold">لوک‌ها</h1>

      {looks.length === 0 ? (
        <p className="text-ink-muted">هنوز لوکی منتشر نشده است.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((l) => (
            <Link
              key={l.id}
              href={`/looks/${l.id}`}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-[3/4] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={l.image}
                  alt={l.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold">{l.title}</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {l.totalClicks.toLocaleString("fa-IR")} کلیک
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
