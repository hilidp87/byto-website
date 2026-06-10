import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const looks = await prisma.look.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { hotspots: true } } },
  });
  return NextResponse.json(looks);
}
