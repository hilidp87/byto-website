import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await prisma.homepageBanner.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "بنر یافت نشد" }, { status: 404 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const banner = await prisma.homepageBanner.update({
    where: { id },
    data: {
      title: body.title !== undefined ? String(body.title) : existing.title,
      subtitle:
        body.subtitle !== undefined
          ? body.subtitle
            ? String(body.subtitle)
            : null
          : existing.subtitle,
      image: body.image !== undefined ? String(body.image) : existing.image,
      link:
        body.link !== undefined ? (body.link ? String(body.link) : null) : existing.link,
      position: body.position !== undefined ? Number(body.position) : existing.position,
      active: body.active !== undefined ? Boolean(body.active) : existing.active,
    },
  });
  return NextResponse.json(banner);
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.homepageBanner.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "بنر یافت نشد" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
