import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(_request: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
  }
  await prisma.productView.create({ data: { productId: product.id } });
  return NextResponse.json({ success: true });
}
