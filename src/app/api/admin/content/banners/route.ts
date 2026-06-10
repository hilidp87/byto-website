import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const banners = await prisma.homepageBanner.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(banners);
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
  const count = await prisma.homepageBanner.count();
  const banner = await prisma.homepageBanner.create({
    data: {
      title,
      subtitle: body.subtitle ? String(body.subtitle) : null,
      image: String(body.image || ""),
      link: body.link ? String(body.link) : null,
      position: body.position !== undefined ? Number(body.position) : count,
      active: body.active === undefined ? true : Boolean(body.active),
    },
  });
  return NextResponse.json(banner, { status: 201 });
}
