import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

interface SeedProduct {
  slug: string;
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  category: string;
  brand?: string;
  material?: string;
}

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
const SHOE_SIZES = ["7", "8", "9", "10", "11", "12"];
const ONE_SIZE = ["One Size"];

const products: SeedProduct[] = [
  // Pants / Jeans
  { slug: "slim-fit-chinos", title: "Slim Fit Chinos", description: "Tailored slim-fit chinos in a breathable cotton blend. A versatile staple that moves from desk to dinner.", price: 79, comparePrice: 99, images: [img("1473966968600-fa801b869a1a"), img("1594938298603-c8148c4a6388")], colors: ["Stone", "Navy", "Olive"], sizes: APPAREL_SIZES, category: "Pants", brand: "LOKYO Essentials", material: "98% Cotton, 2% Elastane" },
  { slug: "blue-baggy-denim", title: "Blue Baggy Denim", description: "Relaxed baggy-fit jeans in a vintage-washed blue denim. Effortless street-ready volume.", price: 89, images: [img("1542272604-787c3835535d"), img("1594938298603-c8148c4a6388")], colors: ["Light Blue", "Mid Blue"], sizes: APPAREL_SIZES, category: "Jeans", brand: "LOKYO Denim", material: "100% Cotton Denim" },
  { slug: "cargo-pants", title: "Cargo Pants", description: "Utility cargo pants with reinforced pockets and a tapered leg. Functional and modern.", price: 95, images: [img("1517445312882-bc9910d018b6"), img("1473966968600-fa801b869a1a")], colors: ["Khaki", "Black"], sizes: APPAREL_SIZES, category: "Pants", brand: "LOKYO Utility", material: "Cotton Ripstop" },
  { slug: "black-slim-jeans", title: "Black Slim Jeans", description: "Clean black slim jeans with subtle stretch for all-day comfort. The wardrobe workhorse.", price: 75, comparePrice: 90, images: [img("1542272604-787c3835535d"), img("1541099649105-f69ad21f3246")], colors: ["Black"], sizes: APPAREL_SIZES, category: "Jeans", brand: "LOKYO Denim", material: "Stretch Denim" },

  // Tees / Shirts
  { slug: "white-linen-shirt", title: "White Linen Shirt", description: "Breezy white linen shirt with a relaxed collar. Summer elegance, perfected.", price: 55, images: [img("1521572163474-6864f9cf17ab"), img("1602810318383-e386cc2a3ccf")], colors: ["White", "Sand"], sizes: APPAREL_SIZES, category: "Shirts", brand: "LOKYO Essentials", material: "100% Linen" },
  { slug: "classic-crew-tee", title: "Classic Crew Tee", description: "Premium heavyweight crew-neck tee with a structured drape. The foundation of every look.", price: 35, images: [img("1521572163474-6864f9cf17ab"), img("1503341504253-dff4815485f1")], colors: ["White", "Black", "Grey"], sizes: APPAREL_SIZES, category: "T-Shirts", brand: "LOKYO Essentials", material: "Organic Cotton" },
  { slug: "oxford-button-down", title: "Oxford Button-Down", description: "Timeless oxford button-down in a soft brushed cotton. Smart-casual done right.", price: 70, comparePrice: 85, images: [img("1602810318383-e386cc2a3ccf"), img("1521572163474-6864f9cf17ab")], colors: ["Sky Blue", "White"], sizes: APPAREL_SIZES, category: "Shirts", brand: "LOKYO Tailoring", material: "Cotton Oxford" },
  { slug: "striped-navy-tee", title: "Striped Navy Tee", description: "Breton-inspired striped tee in navy and white. A nautical classic with modern fit.", price: 40, images: [img("1503341504253-dff4815485f1"), img("1521572163474-6864f9cf17ab")], colors: ["Navy/White"], sizes: APPAREL_SIZES, category: "T-Shirts", brand: "LOKYO Essentials", material: "Cotton Jersey" },

  // Outerwear
  { slug: "camel-wool-coat", title: "Camel Wool Coat", description: "Refined single-breasted overcoat in a warm camel wool blend. Investment-grade outerwear.", price: 299, comparePrice: 380, images: [img("1544022613-e87ca75a784a"), img("1551028719-00167b16eac5")], colors: ["Camel"], sizes: APPAREL_SIZES, category: "Jackets", brand: "LOKYO Atelier", material: "Wool Blend" },
  { slug: "leather-biker-jacket", title: "Leather Biker Jacket", description: "Asymmetric-zip biker jacket in supple lambskin. Edge that lasts a lifetime.", price: 349, images: [img("1551028719-00167b16eac5"), img("1520975954732-35dd22299614")], colors: ["Black"], sizes: APPAREL_SIZES, category: "Jackets", brand: "LOKYO Atelier", material: "Lambskin Leather" },
  { slug: "light-denim-jacket", title: "Light Denim Jacket", description: "Classic trucker denim jacket in a light wash. The perfect layering piece year-round.", price: 150, comparePrice: 180, images: [img("1544441893-675973e31985"), img("1551028719-00167b16eac5")], colors: ["Light Blue"], sizes: APPAREL_SIZES, category: "Jackets", brand: "LOKYO Denim", material: "Cotton Denim" },

  // Footwear
  { slug: "white-leather-sneakers", title: "White Leather Sneakers", description: "Minimalist low-top sneakers in premium white leather. Goes with everything.", price: 120, images: [img("1542291026-7eec264c27ff"), img("1525966222134-fcfa99b8ae77")], colors: ["White"], sizes: SHOE_SIZES, category: "Sneakers", brand: "LOKYO Footwear", material: "Full-grain Leather" },
  { slug: "chelsea-boots", title: "Chelsea Boots", description: "Sleek suede Chelsea boots with elasticated sides. Effortless sophistication.", price: 189, comparePrice: 220, images: [img("1608256246200-53e635b5b65f"), img("1542291026-7eec264c27ff")], colors: ["Tan", "Black"], sizes: SHOE_SIZES, category: "Boots", brand: "LOKYO Footwear", material: "Suede" },
  { slug: "suede-loafers", title: "Suede Loafers", description: "Hand-finished suede penny loafers. Refined comfort for smart occasions.", price: 145, images: [img("1614252369475-531eba835eb1"), img("1608256246200-53e635b5b65f")], colors: ["Brown"], sizes: SHOE_SIZES, category: "Boots", brand: "LOKYO Footwear", material: "Suede" },

  // Accessories
  { slug: "silver-minimalist-watch", title: "Silver Minimalist Watch", description: "Clean-dial automatic watch with a brushed stainless case. Quiet luxury on the wrist.", price: 199, comparePrice: 249, images: [img("1524592094714-0f0654e20314"), img("1523275335684-37898b6baf30")], colors: ["Silver"], sizes: ONE_SIZE, category: "Watches", brand: "LOKYO Time", material: "Stainless Steel" },
  { slug: "wayfarers-sunglasses", title: "Wayfarers Sunglasses", description: "Iconic wayfarer sunglasses with UV400 polarized lenses. A timeless silhouette.", price: 85, images: [img("1572635196237-14b3f281503f"), img("1511499767150-a48a237f0083")], colors: ["Black", "Tortoise"], sizes: ONE_SIZE, category: "Sunglasses", brand: "LOKYO Optics", material: "Acetate" },
  { slug: "canvas-tote-bag", title: "Canvas Tote Bag", description: "Heavyweight canvas tote with leather handles. Carry the day in style.", price: 55, images: [img("1553062407-98eeb64c6a62"), img("1584917865442-de89df76afd3")], colors: ["Natural", "Black"], sizes: ONE_SIZE, category: "Bags", brand: "LOKYO Essentials", material: "Cotton Canvas" },

  // Hoodies / Knitwear
  { slug: "oversized-beige-hoodie", title: "Oversized Beige Hoodie", description: "Plush oversized hoodie in a warm beige. Loungewear elevated to a statement.", price: 99, images: [img("1556821840-3a63f95609a7"), img("1620799140408-edc6dcb6d633")], colors: ["Beige", "Charcoal"], sizes: APPAREL_SIZES, category: "Hoodies", brand: "LOKYO Comfort", material: "Cotton Fleece" },
  { slug: "merino-crew-sweater", title: "Merino Crew Sweater", description: "Fine-gauge merino wool crew-neck sweater. Lightweight warmth with refined drape.", price: 130, comparePrice: 160, images: [img("1576566588028-4147f3842f27"), img("1556821840-3a63f95609a7")], colors: ["Grey", "Navy", "Forest"], sizes: APPAREL_SIZES, category: "Hoodies", brand: "LOKYO Knitwear", material: "100% Merino Wool" },
  { slug: "zip-up-tech-fleece", title: "Zip-Up Tech Fleece", description: "Modern zip-up fleece in a technical bonded fabric. Sleek warmth on the move.", price: 110, images: [img("1620799140408-edc6dcb6d633"), img("1556821840-3a63f95609a7")], colors: ["Black", "Slate"], sizes: APPAREL_SIZES, category: "Hoodies", brand: "LOKYO Tech", material: "Bonded Fleece" },

  // Extra accessory for hats category
  { slug: "wool-felt-hat", title: "Wool Felt Hat", description: "Structured wide-brim felt hat in charcoal wool. A finishing touch with attitude.", price: 65, images: [img("1521369909029-2afed882baee"), img("1576871337622-98d48d1cf531")], colors: ["Charcoal"], sizes: ONE_SIZE, category: "Hats", brand: "LOKYO Accessories", material: "Wool Felt" },
];

interface SeedStyle {
  slug: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  bundleDiscount: number;
  season?: string;
  occasion?: string;
  items: { productSlug: string; x: number; y: number }[];
}

const cover = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

const styles: SeedStyle[] = [
  {
    slug: "weekend-casual", title: "Weekend Casual", category: "Casual",
    description: "Relaxed pieces that pair comfort with quiet style — your go-to for slow Saturdays.",
    coverImage: cover("1483985988355-763728e1935b"), bundleDiscount: 12, season: "All Year", occasion: "Everyday",
    items: [
      { productSlug: "classic-crew-tee", x: 50, y: 28 },
      { productSlug: "blue-baggy-denim", x: 48, y: 62 },
      { productSlug: "white-leather-sneakers", x: 52, y: 90 },
      { productSlug: "canvas-tote-bag", x: 78, y: 55 },
    ],
  },
  {
    slug: "business-refined", title: "Business Refined", category: "Workwear",
    description: "Tailored essentials that command the room. Sharp, considered, and quietly powerful.",
    coverImage: cover("1507003211169-0a1dd7228f2d"), bundleDiscount: 10, season: "All Year", occasion: "Office",
    items: [
      { productSlug: "oxford-button-down", x: 50, y: 30 },
      { productSlug: "slim-fit-chinos", x: 49, y: 65 },
      { productSlug: "suede-loafers", x: 51, y: 92 },
      { productSlug: "silver-minimalist-watch", x: 70, y: 48 },
    ],
  },
  {
    slug: "street-edge", title: "Street Edge", category: "Streetwear",
    description: "Volume, attitude and layered textures. A look built for the city after dark.",
    coverImage: cover("1523398002811-999ca8dec234"), bundleDiscount: 15, season: "Autumn", occasion: "Night Out",
    items: [
      { productSlug: "oversized-beige-hoodie", x: 50, y: 32 },
      { productSlug: "cargo-pants", x: 48, y: 66 },
      { productSlug: "white-leather-sneakers", x: 52, y: 91 },
      { productSlug: "wayfarers-sunglasses", x: 50, y: 14 },
    ],
  },
  {
    slug: "smart-evening", title: "Smart Evening", category: "Party",
    description: "Elevated separates for dinners and celebrations. Polished with an effortless edge.",
    coverImage: cover("1492447166138-50c3889fccb1"), bundleDiscount: 12, season: "Winter", occasion: "Evening",
    items: [
      { productSlug: "merino-crew-sweater", x: 50, y: 30 },
      { productSlug: "black-slim-jeans", x: 49, y: 64 },
      { productSlug: "chelsea-boots", x: 51, y: 91 },
      { productSlug: "leather-biker-jacket", x: 25, y: 40 },
    ],
  },
  {
    slug: "campus-cool", title: "Campus Cool", category: "University",
    description: "Easy, layered pieces that carry you from lecture hall to late-night study.",
    coverImage: cover("1523050854058-8df90110c9f1"), bundleDiscount: 13, season: "Autumn", occasion: "Daytime",
    items: [
      { productSlug: "striped-navy-tee", x: 50, y: 29 },
      { productSlug: "light-denim-jacket", x: 28, y: 40 },
      { productSlug: "slim-fit-chinos", x: 49, y: 66 },
      { productSlug: "white-leather-sneakers", x: 51, y: 91 },
      { productSlug: "wool-felt-hat", x: 50, y: 10 },
    ],
  },
  {
    slug: "minimalist-monday", title: "Minimalist Monday", category: "Minimalist",
    description: "A pared-back palette of essentials. Nothing extra, everything intentional.",
    coverImage: cover("1490481651871-ab68de25d43d"), bundleDiscount: 10, season: "All Year", occasion: "Everyday",
    items: [
      { productSlug: "white-linen-shirt", x: 50, y: 30 },
      { productSlug: "black-slim-jeans", x: 49, y: 65 },
      { productSlug: "suede-loafers", x: 51, y: 92 },
      { productSlug: "silver-minimalist-watch", x: 71, y: 47 },
    ],
  },
];

async function main() {
  console.log("Clearing existing data…");
  await prisma.styleItem.deleteMany();
  await prisma.style.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.product.deleteMany();

  console.log("Seeding products…");
  const slugToId: Record<string, string> = {};
  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        category: p.category,
        brand: p.brand ?? null,
        material: p.material ?? null,
        stock: 100,
      },
    });
    slugToId[p.slug] = created.id;
  }

  console.log("Seeding outfits…");
  for (const s of styles) {
    await prisma.style.create({
      data: {
        slug: s.slug,
        title: s.title,
        category: s.category,
        description: s.description,
        coverImage: s.coverImage,
        bundleDiscount: s.bundleDiscount,
        season: s.season ?? null,
        occasion: s.occasion ?? null,
        items: {
          create: s.items.map((i) => ({
            productId: slugToId[i.productSlug],
            hotspotX: i.x,
            hotspotY: i.y,
          })),
        },
      },
    });
  }

  console.log("Seeding demo user…");
  const password = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "demo@lokyo.com" },
    update: {},
    create: { name: "Demo User", email: "demo@lokyo.com", password },
  });

  console.log(`Seeded ${products.length} products and ${styles.length} outfits.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
