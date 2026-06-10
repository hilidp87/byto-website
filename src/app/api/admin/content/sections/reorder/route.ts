import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { sections?: { id: string; position: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const sections = Array.isArray(body.sections) ? body.sections : [];
  await prisma.$transaction(
    sections.map((s) =>
      prisma.homepageSection.update({
        where: { id: String(s.id) },
        data: { position: Number(s.position) },
      })
    )
  );
  return NextResponse.json({ success: true });
}
