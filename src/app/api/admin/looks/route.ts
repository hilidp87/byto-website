import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const looks = await prisma.look.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { hotspots: true } } },
  });
  return NextResponse.json(looks);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const title = String(body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
  }
  const look = await prisma.look.create({
    data: {
      title,
      description: body.description ? String(body.description) : null,
      image: String(body.image || ""),
      active: body.active === undefined ? true : Boolean(body.active),
    },
  });
  return NextResponse.json(look, { status: 201 });
}
