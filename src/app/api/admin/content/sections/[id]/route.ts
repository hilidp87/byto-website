import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await prisma.homepageSection.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "بخش یافت نشد" }, { status: 404 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const section = await prisma.homepageSection.update({
    where: { id },
    data: {
      active: body.active !== undefined ? Boolean(body.active) : existing.active,
      label: body.label !== undefined ? String(body.label) : existing.label,
      position: body.position !== undefined ? Number(body.position) : existing.position,
    },
  });
  return NextResponse.json(section);
}
