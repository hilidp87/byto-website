import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const hotspots = await prisma.lookHotspot.findMany({
    where: { lookId: id },
    include: { product: true },
  });
  return NextResponse.json(hotspots);
}

export async function POST(request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const look = await prisma.look.findUnique({ where: { id } });
  if (!look) {
    return NextResponse.json({ error: "لوک یافت نشد" }, { status: 404 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const productId = String(body.productId || "");
  if (!productId) {
    return NextResponse.json({ error: "انتخاب محصول الزامی است" }, { status: 400 });
  }
  const hotspot = await prisma.lookHotspot.create({
    data: {
      lookId: id,
      productId,
      x: Number(body.x) || 0,
      y: Number(body.y) || 0,
      label: body.label ? String(body.label) : null,
    },
    include: { product: true },
  });
  return NextResponse.json(hotspot, { status: 201 });
}
