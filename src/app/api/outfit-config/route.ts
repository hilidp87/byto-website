import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configs = await prisma.outfitConfig.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(
      configs.map((c) => ({ ...c, updatedAt: c.updatedAt.toISOString() }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
