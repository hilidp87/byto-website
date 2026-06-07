import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Order History",
  description: "View your LOKYO order history.",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id?: string }).id;
  const orders = userId
    ? await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } }, payment: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl font-bold">Order History</h1>

      {orders.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ink-muted">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="mt-4 inline-block font-medium text-primary hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-line">
              <div className="flex items-center justify-between border-b border-line p-4">
                <div>
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-ink-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={order.status === "paid" ? "primary" : "muted"}>
                    {order.status}
                  </Badge>
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                </div>
              </div>
              <ul className="divide-y divide-line p-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-3">
                    <div className="relative h-16 w-12 overflow-hidden rounded-lg bg-surface">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-xs text-ink-muted">
                        {[item.color, item.size].filter(Boolean).join(" / ")} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
