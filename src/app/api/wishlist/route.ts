import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function userId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ items: [] });
  const items = await prisma.wishlistItem.findMany({
    where: { userId: id },
    include: { product: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = await req.json();
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: id, productId } },
    create: { userId: id, productId },
    update: {},
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = await req.json();
  await prisma.wishlistItem.deleteMany({ where: { userId: id, productId } });
  return NextResponse.json({ success: true });
}
