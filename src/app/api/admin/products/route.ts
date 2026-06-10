import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "product"
  );
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Ensure unique slug
  let baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const images = Array.isArray(body.images)
    ? (body.images as string[]).filter((s) => s && s.trim())
    : [];

  const product = await prisma.product.create({
    data: {
      slug,
      title,
      description: String(body.description || ""),
      price: Number(body.price) || 0,
      comparePrice:
        body.comparePrice === null || body.comparePrice === undefined || body.comparePrice === ""
          ? null
          : Number(body.comparePrice),
      images,
      colors: Array.isArray(body.colors) ? (body.colors as string[]) : [],
      sizes: Array.isArray(body.sizes) ? (body.sizes as string[]) : [],
      stock: Number(body.stock) || 0,
      category: String(body.category || "Accessories"),
      brand: body.brand ? String(body.brand) : null,
      material: body.material ? String(body.material) : null,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : [],
    },
  });

  return NextResponse.json(product, { status: 201 });
}
