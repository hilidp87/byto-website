import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const images = Array.isArray(body.images)
    ? (body.images as string[]).filter((s) => s && s.trim())
    : existing.images;

  const product = await prisma.product.update({
    where: { id },
    data: {
      title: body.title !== undefined ? String(body.title) : existing.title,
      description:
        body.description !== undefined ? String(body.description) : existing.description,
      price: body.price !== undefined ? Number(body.price) : existing.price,
      comparePrice:
        body.comparePrice === undefined
          ? existing.comparePrice
          : body.comparePrice === null || body.comparePrice === ""
            ? null
            : Number(body.comparePrice),
      images,
      colors: Array.isArray(body.colors) ? (body.colors as string[]) : existing.colors,
      sizes: Array.isArray(body.sizes) ? (body.sizes as string[]) : existing.sizes,
      stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
      category: body.category !== undefined ? String(body.category) : existing.category,
      brand: body.brand !== undefined ? (body.brand ? String(body.brand) : null) : existing.brand,
      material:
        body.material !== undefined
          ? body.material
            ? String(body.material)
            : null
          : existing.material,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : existing.tags,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
