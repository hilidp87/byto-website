import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string; hotspotId: string }> };

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { hotspotId } = await ctx.params;
  try {
    await prisma.lookHotspot.delete({ where: { id: hotspotId } });
  } catch {
    return NextResponse.json({ error: "هات‌اسپات یافت نشد" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
