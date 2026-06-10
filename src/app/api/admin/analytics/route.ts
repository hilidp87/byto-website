import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ----- Revenue chart: past 90 days daily revenue -----
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  const paidOrders = await prisma.order.findMany({
    where: { createdAt: { gte: ninetyDaysAgo } },
    select: { total: true, createdAt: true },
  });

  const revenueMap: Record<string, number> = {};
  for (let i = 0; i < 90; i++) {
    const d = new Date(ninetyDaysAgo);
    d.setDate(ninetyDaysAgo.getDate() + i);
    revenueMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const o of paidOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (key in revenueMap) revenueMap[key] += o.total;
  }
  const revenueChart = Object.entries(revenueMap).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));

  // ----- Top selling products -----
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true, price: true },
  });
  const soldRanking = grouped
    .map((g) => ({
      productId: g.productId,
      sold: g._sum.quantity || 0,
      revenue: 0,
      items: g,
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 10);

  // Compute revenue per product (price * quantity); groupBy sums price only,
  // so recompute precisely via items.
  const topProductIds = soldRanking.map((s) => s.productId);
  const topItemsRaw = await prisma.orderItem.findMany({
    where: { productId: { in: topProductIds } },
    select: { productId: true, price: true, quantity: true },
  });
  const revByProduct: Record<string, number> = {};
  for (const it of topItemsRaw) {
    revByProduct[it.productId] = (revByProduct[it.productId] || 0) + it.price * it.quantity;
  }
  const topProductsData = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
  });
  const topProductsMap = new Map(topProductsData.map((p) => [p.id, p]));
  const topProducts = soldRanking
    .filter((s) => topProductsMap.has(s.productId))
    .map((s) => {
      const p = topProductsMap.get(s.productId)!;
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        sold: s.sold,
        revenue: Math.round((revByProduct[s.productId] || 0) * 100) / 100,
        images: p.images,
      };
    });

  // ----- Best performing looks -----
  const looks = await prisma.look.findMany({
    include: {
      hotspots: {
        include: { _count: { select: { conversions: true } } },
      },
    },
  });
  const bestLooks = looks
    .map((l) => {
      const conversions = l.hotspots.reduce(
        (acc, h) => acc + h._count.conversions,
        0
      );
      const clicks = l.totalClicks;
      return {
        id: l.id,
        title: l.title,
        image: l.image,
        clicks,
        conversions,
        conversionRate: clicks > 0 ? Math.round((conversions / clicks) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  // ----- Customer growth: new customers per month past 12 months -----
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: twelveMonthsAgo } },
    select: { createdAt: true },
  });
  const monthMap: Record<string, number> = {};
  for (let i = 0; i < 12; i++) {
    const d = new Date(twelveMonthsAgo);
    d.setMonth(twelveMonthsAgo.getMonth() + i);
    monthMap[d.toISOString().slice(0, 7)] = 0;
  }
  for (const u of users) {
    const key = u.createdAt.toISOString().slice(0, 7);
    if (key in monthMap) monthMap[key] += 1;
  }
  const customerGrowth = Object.entries(monthMap).map(([month, count]) => ({
    month,
    count,
  }));

  // ----- Most viewed products -----
  const viewGrouped = await prisma.productView.groupBy({
    by: ["productId"],
    _count: { productId: true },
  });
  const viewRanking = viewGrouped
    .map((v) => ({ productId: v.productId, views: v._count.productId }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  const viewedProductsData = await prisma.product.findMany({
    where: { id: { in: viewRanking.map((v) => v.productId) } },
  });
  const viewedMap = new Map(viewedProductsData.map((p) => [p.id, p]));
  const mostViewed = viewRanking
    .filter((v) => viewedMap.has(v.productId))
    .map((v) => {
      const p = viewedMap.get(v.productId)!;
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        views: v.views,
        images: p.images,
      };
    });

  return NextResponse.json({
    revenueChart,
    topProducts,
    bestLooks,
    customerGrowth,
    mostViewed,
  });
}
