import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock";

const registry: Record<string, () => PaymentProvider> = {
  mock: () => new MockPaymentProvider(),
};

export function getPaymentProvider(): PaymentProvider {
  const key = process.env.PAYMENT_PROVIDER || "mock";
  const factory = registry[key] ?? registry.mock;
  return factory();
}

export type { PaymentProvider } from "./types";
