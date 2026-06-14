import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "OutfitPosition" (
        "id"          TEXT NOT NULL,
        "outfitId"    TEXT NOT NULL,
        "topX"        DOUBLE PRECISION NOT NULL,
        "topY"        DOUBLE PRECISION NOT NULL,
        "topWidth"    DOUBLE PRECISION NOT NULL,
        "splitY"      DOUBLE PRECISION NOT NULL,
        "bottomX"     DOUBLE PRECISION NOT NULL,
        "bottomY"     DOUBLE PRECISION NOT NULL,
        "bottomWidth" DOUBLE PRECISION NOT NULL,
        "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OutfitPosition_pkey" PRIMARY KEY ("id")
      )
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "OutfitPosition_outfitId_key"
      ON "OutfitPosition"("outfitId")
    `;

    // Verify the table is queryable
    const count = await prisma.outfitPosition.count();
    return NextResponse.json({ ok: true, rows: count });
  } catch (err) {
    console.error("[migrate] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
