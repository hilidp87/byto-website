import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.outfitPosition.findMany();
    // Convert DB rows to the OutfitPositions shape the showcase expects
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
