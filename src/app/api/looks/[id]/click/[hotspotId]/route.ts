import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string; hotspotId: string }> };

export async function POST(_request: NextRequest, ctx: Ctx) {
  const { id, hotspotId } = await ctx.params;
  const hotspot = await prisma.lookHotspot.findFirst({
    where: { id: hotspotId, lookId: id },
  });
  if (!hotspot) {
    return NextResponse.json({ error: "هات‌اسپات یافت نشد" }, { status: 404 });
  }
  await prisma.$transaction([
    prisma.look.update({ where: { id }, data: { totalClicks: { increment: 1 } } }),
    prisma.lookHotspot.update({
      where: { id: hotspotId },
      data: { clicks: { increment: 1 } },
    }),
    prisma.hotspotClick.create({ data: { hotspotId } }),
  ]);
  return NextResponse.json({ success: true });
}
