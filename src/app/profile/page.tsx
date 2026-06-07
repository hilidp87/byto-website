import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your LOKYO account and view order history.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id?: string }).id;
  const orders = userId
    ? await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl font-bold">My Account</h1>
        <SignOutButton />
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-serif text-xl font-semibold">Profile</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 text-ink-muted">Name</dt>
            <dd className="font-medium">{session.user.name || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 text-ink-muted">Email</dt>
            <dd className="font-medium">{session.user.email}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold">Recent Orders</h2>
          <Link href="/orders" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-ink-muted">No orders yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium">#{o.id.slice(0, 8)}</p>
                  <p className="text-ink-muted">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={o.status === "paid" ? "primary" : "muted"}>{o.status}</Badge>
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
