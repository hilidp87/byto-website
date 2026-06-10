import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6); // last 7 days incl today
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const start30 = new Date(startOfToday);
  start30.setDate(start30.getDate() - 29);

  const [ordersToday, todayAgg, weekAgg, monthAgg, recentOrders, lowStockProducts, chartOrders] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfWeek } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { email: true, name: true } },
          items: { select: { id: true } },
        },
      }),
      prisma.product.findMany({
        where: { stock: { lt: 10 } },
        orderBy: { stock: "asc" },
        select: { id: true, title: true, stock: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: start30 } },
        select: { total: true, createdAt: true },
      }),
    ]);

  // Build a 30-day revenue map
  const dayMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(start30);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, 0);
  }
  for (const o of chartOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) || 0) + o.total);
    }
  }
  const revenueChart = Array.from(dayMap.entries()).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));

  return NextResponse.json({
    ordersToday,
    revenueToday: Math.round((todayAgg._sum.total || 0) * 100) / 100,
    revenueWeek: Math.round((weekAgg._sum.total || 0) * 100) / 100,
    revenueMonth: Math.round((monthAgg._sum.total || 0) * 100) / 100,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      email: o.user?.email ?? "—",
      total: o.total,
      status: o.status,
      itemsCount: o.items.length,
      createdAt: o.createdAt,
    })),
    lowStockProducts,
    revenueChart,
  });
}
