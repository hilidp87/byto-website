import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isR2Configured, uploadToR2 } from "@/lib/r2";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "فایلی ارسال نشد" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "فقط فرمت‌های JPG، PNG، WebP و GIF مجاز هستند" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "حجم فایل نباید از ۱۰ مگابایت بیشتر باشد" }, { status: 400 });
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(bytes);

  if (isR2Configured()) {
    try {
      const url = await uploadToR2(`uploads/${filename}`, buffer, file.type);
      return NextResponse.json({ url });
    } catch (err) {
      console.error("R2 upload failed:", err);
      return NextResponse.json({ error: "آپلود به فضای ابری ناموفق بود" }, { status: 500 });
    }
  }

  // Fallback: local filesystem (ephemeral on Railway — set R2 env vars for persistence)
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
