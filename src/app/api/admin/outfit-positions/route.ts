import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await prisma.outfitPosition.findMany();
    const result: Record<string, object> = {};
    for (const row of rows) {
      result[row.outfitId] = {
        top: {
          x: `${row.topX}%`,
          y: `${row.topY}%`,
          width: `${row.topWidth}%`,
          splitY: row.splitY,
        },
        bottom: {
          x: `${row.bottomX}%`,
          y: `${row.bottomY}%`,
          width: `${row.bottomWidth}%`,
        },
      };
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // body is { [outfitId]: { top: { x, y, width, splitY }, bottom: { x, y, width } } }
  const entries = Object.entries(body) as [string, {
    top: { x: string; y: string; width: string; splitY: number };
    bottom: { x: string; y: string; width: string };
  }][];

  await Promise.all(
    entries.map(([outfitId, data]) =>
      prisma.outfitPosition.upsert({
        where: { outfitId },
        update: {
          topX: parseFloat(data.top.x),
          topY: parseFloat(data.top.y),
          topWidth: parseFloat(data.top.width),
          splitY: data.top.splitY,
          bottomX: parseFloat(data.bottom.x),
          bottomY: parseFloat(data.bottom.y),
          bottomWidth: parseFloat(data.bottom.width),
        },
        create: {
          outfitId,
          topX: parseFloat(data.top.x),
          topY: parseFloat(data.top.y),
          topWidth: parseFloat(data.top.width),
          splitY: data.top.splitY,
          bottomX: parseFloat(data.bottom.x),
          bottomY: parseFloat(data.bottom.y),
          bottomWidth: parseFloat(data.bottom.width),
        },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
