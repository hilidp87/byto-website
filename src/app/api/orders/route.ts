import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment";

async function userId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ orders: [] });
  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } }, payment: true },
  });
  return NextResponse.json({ orders });
}

interface OrderLine {
  productId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export async function POST(req: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = (await req.json()) as { items: OrderLine[] };
  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: id,
      total,
      status: "pending",
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          size: i.size,
          color: i.color,
        })),
      },
    },
  });

  const provider = getPaymentProvider();
  const init = await provider.initiate({ id: order.id, amount: total, userId: id });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: provider.name,
      amount: total,
      status: "pending",
      reference: init.token,
    },
  });

  return NextResponse.json({ orderId: order.id, redirectUrl: init.redirectUrl });
}
