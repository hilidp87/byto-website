import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const configs = await prisma.outfitConfig.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(
      configs.map((c) => ({ ...c, updatedAt: c.updatedAt.toISOString() }))
    );
  } catch (err) {
    console.error("[admin/outfit-config GET]", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const {
    slotId, title, subtitle, href,
    shirtSrc, shirtX, shirtY, shirtWidth, shirtRotation,
    pantsSrc, pantsX, pantsY, pantsWidth, pantsRotation,
    active, sortOrder,
  } = body;

  if (!slotId) {
    return NextResponse.json({ error: "slotId required" }, { status: 400 });
  }

  const data = {
    title: title ?? "",
    subtitle: subtitle ?? "",
    href: href ?? "/looks",
    shirtSrc: shirtSrc ?? "",
    shirtX: shirtX ?? 300,
    shirtY: shirtY ?? 280,
    shirtWidth: shirtWidth ?? 300,
    shirtRotation: shirtRotation ?? 0,
    pantsSrc: pantsSrc ?? "",
    pantsX: pantsX ?? 300,
    pantsY: pantsY ?? 650,
    pantsWidth: pantsWidth ?? 330,
    pantsRotation: pantsRotation ?? 0,
    active: active ?? true,
    sortOrder: sortOrder ?? 0,
  };

  try {
    const result = await prisma.outfitConfig.upsert({
      where: { slotId },
      update: data,
      create: { slotId, ...data },
    });
    return NextResponse.json({ ok: true, data: { ...result, updatedAt: result.updatedAt.toISOString() } });
  } catch (err) {
    console.error("[admin/outfit-config POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
