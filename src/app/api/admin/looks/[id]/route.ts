import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const look = await prisma.look.findUnique({
    where: { id },
    include: { hotspots: { include: { product: true } } },
  });
  if (!look) {
    return NextResponse.json({ error: "لوک یافت نشد" }, { status: 404 });
  }
  return NextResponse.json(look);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await prisma.look.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "لوک یافت نشد" }, { status: 404 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const look = await prisma.look.update({
    where: { id },
    data: {
      title: body.title !== undefined ? String(body.title) : existing.title,
      description:
        body.description !== undefined
          ? body.description
            ? String(body.description)
            : null
          : existing.description,
      image: body.image !== undefined ? String(body.image) : existing.image,
      active: body.active !== undefined ? Boolean(body.active) : existing.active,
    },
  });
  return NextResponse.json(look);
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.look.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "لوک یافت نشد" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
