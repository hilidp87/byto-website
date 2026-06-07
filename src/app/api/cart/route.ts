import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cart is primarily client-side (Zustand). This endpoint validates/hydrates
// cart line items against live product data (price, stock, availability).
export async function POST(req: Request) {
  const { productIds } = await req.json();
  if (!Array.isArray(productIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, slug: true, title: true, price: true, stock: true, images: true },
  });
  return NextResponse.json({ products });
}
