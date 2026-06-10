import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const look = await prisma.look.findFirst({
    where: { id, active: true },
    include: { hotspots: { include: { product: true } } },
  });
  if (!look) {
    return NextResponse.json({ error: "لوک یافت نشد" }, { status: 404 });
  }
  return NextResponse.json(look);
}
