import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isSupabaseConfigured, uploadToSupabasePath } from "@/lib/supabase-storage";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const outfitId = formData.get("outfitId");
  const topCrop = formData.get("topCrop");
  const bottomCrop = formData.get("bottomCrop");

  if (
    typeof outfitId !== "string" ||
    !outfitId ||
    !topCrop || typeof topCrop === "string" ||
    !bottomCrop || typeof bottomCrop === "string"
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const topBuffer = Buffer.from(await topCrop.arrayBuffer());
  const bottomBuffer = Buffer.from(await bottomCrop.arrayBuffer());

  let topUrl: string;
  let bottomUrl: string;

  if (isSupabaseConfigured()) {
    try {
      [topUrl, bottomUrl] = await Promise.all([
        uploadToSupabasePath(`outfits/${outfitId}-top.png`, topBuffer, "image/png"),
        uploadToSupabasePath(`outfits/${outfitId}-bottom.png`, bottomBuffer, "image/png"),
      ]);
    } catch (err) {
      console.error("[upload-crops] Supabase upload failed:", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } else {
    // Fallback: local public/outfits directory
    const outfitsDir = path.join(process.cwd(), "public", "outfits");
    await mkdir(outfitsDir, { recursive: true });
    await Promise.all([
      writeFile(path.join(outfitsDir, `${outfitId}-top.png`), topBuffer),
      writeFile(path.join(outfitsDir, `${outfitId}-bottom.png`), bottomBuffer),
    ]);
    topUrl = `/outfits/${outfitId}-top.png`;
    bottomUrl = `/outfits/${outfitId}-bottom.png`;
  }

  // Persist URLs in DB
  try {
    await prisma.outfitPosition.updateMany({
      where: { outfitId },
      data: { topSrc: topUrl, bottomSrc: bottomUrl },
    });
  } catch (err) {
    console.warn("[upload-crops] DB update failed (row may not exist yet):", err);
  }

  return NextResponse.json({ topUrl, bottomUrl });
}
