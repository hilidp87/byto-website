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

    // Add topSrc / bottomSrc columns (idempotent)
    await prisma.$executeRaw`
      ALTER TABLE "OutfitPosition"
        ADD COLUMN IF NOT EXISTS "topSrc"    TEXT,
        ADD COLUMN IF NOT EXISTS "bottomSrc" TEXT
    `;

    // ── OutfitConfig table ───────────────────────────────────────────────
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "OutfitConfig" (
        "id"            TEXT NOT NULL,
        "slotId"        TEXT NOT NULL,
        "title"         TEXT NOT NULL DEFAULT '',
        "subtitle"      TEXT NOT NULL DEFAULT '',
        "href"          TEXT NOT NULL DEFAULT '/looks',
        "shirtSrc"      TEXT NOT NULL DEFAULT '',
        "shirtX"        DOUBLE PRECISION NOT NULL DEFAULT 300,
        "shirtY"        DOUBLE PRECISION NOT NULL DEFAULT 280,
        "shirtWidth"    DOUBLE PRECISION NOT NULL DEFAULT 300,
        "shirtRotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "pantsSrc"      TEXT NOT NULL DEFAULT '',
        "pantsX"        DOUBLE PRECISION NOT NULL DEFAULT 300,
        "pantsY"        DOUBLE PRECISION NOT NULL DEFAULT 650,
        "pantsWidth"    DOUBLE PRECISION NOT NULL DEFAULT 330,
        "pantsRotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "active"        BOOLEAN NOT NULL DEFAULT true,
        "sortOrder"     INTEGER NOT NULL DEFAULT 0,
        "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "OutfitConfig_pkey" PRIMARY KEY ("id")
      )
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "OutfitConfig_slotId_key"
      ON "OutfitConfig"("slotId")
    `;

    // Seed default slots if they don't exist
    const defaults = [
      { slotId: "slot-1", title: "Campus Cool",    subtitle: "White cardigan · crop tank · tailored shorts", sortOrder: 0 },
      { slotId: "slot-2", title: "Street Minimal", subtitle: "Black crop tee · wide-leg baggy jeans",        sortOrder: 1 },
      { slotId: "slot-3", title: "Denim Dream",    subtitle: "Lace bralette · wide-leg baggy jeans",         sortOrder: 2 },
    ];
    for (const d of defaults) {
      await prisma.$executeRaw`
        INSERT INTO "OutfitConfig" ("id","slotId","title","subtitle","updatedAt","sortOrder")
        VALUES (gen_random_uuid()::text, ${d.slotId}, ${d.title}, ${d.subtitle}, NOW(), ${d.sortOrder})
        ON CONFLICT ("slotId") DO NOTHING
      `;
    }

    const count = await prisma.outfitPosition.count();
    return NextResponse.json({ ok: true, rows: count });
  } catch (err) {
    console.error("[migrate] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
