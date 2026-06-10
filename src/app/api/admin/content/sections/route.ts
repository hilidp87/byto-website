import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const DEFAULT_SECTIONS = [
  { type: "hero", label: "هیرو اصلی", position: 0, active: true },
  { type: "outfit_categories", label: "دسته‌بندی ست‌ها", position: 1, active: true },
  { type: "featured_outfits", label: "ست‌های ویژه", position: 2, active: true },
  { type: "product_categories", label: "دسته‌بندی محصولات", position: 3, active: true },
  { type: "trending", label: "محصولات پرطرفدار", position: 4, active: true },
  { type: "shop_the_look_banner", label: "بنر شاپ د لوک", position: 5, active: true },
];

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let sections = await prisma.homepageSection.findMany({
    orderBy: { position: "asc" },
  });
  if (sections.length === 0) {
    await prisma.homepageSection.createMany({ data: DEFAULT_SECTIONS });
    sections = await prisma.homepageSection.findMany({ orderBy: { position: "asc" } });
  }
  return NextResponse.json(sections);
}
