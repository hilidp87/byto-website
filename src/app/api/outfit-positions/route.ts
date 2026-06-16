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
        topSrc: row.topSrc ?? null,
        bottomSrc: row.bottomSrc ?? null,
      };
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[outfit-positions] DB error:", err);
    return NextResponse.json({});
  }
}
