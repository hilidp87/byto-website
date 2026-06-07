import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment";

export async function POST(req: Request) {
  const { orderId, ref } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const provider = getPaymentProvider();
  const result = await provider.verify(ref || "");

  if (result.success) {
    await prisma.order.update({ where: { id: orderId }, data: { status: "paid" } });
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: "paid", reference: result.reference },
    });
  }

  return NextResponse.json({ success: result.success });
}
