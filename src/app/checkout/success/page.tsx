"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/Button";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const ref = params.get("ref");
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!orderId) {
      setVerified(false);
      return;
    }
    fetch("/api/orders/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, ref }),
    })
      .then((r) => r.json())
      .then((d) => setVerified(d.success))
      .catch(() => setVerified(false));
  }, [orderId, ref]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <CheckCircleIcon className="h-16 w-16 text-primary" />
      <h1 className="mt-6 font-serif text-4xl font-bold">Thank you!</h1>
      <p className="mt-2 text-ink-muted">
        {verified === false
          ? "We received your order, but payment verification is still pending."
          : "Your order has been placed and payment confirmed."}
      </p>
      {orderId && (
        <p className="mt-2 text-sm text-ink-muted">
          Order reference: <span className="font-medium text-ink">{orderId}</span>
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <Link href="/orders">
          <Button>View Orders</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="py-40 text-center text-ink-muted">Confirming…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
