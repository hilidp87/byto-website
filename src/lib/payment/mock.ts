import type {
  PaymentProvider,
  PaymentOrder,
  PaymentInitiation,
  PaymentVerification,
} from "./types";

export class MockPaymentProvider implements PaymentProvider {
  name = "mock";

  async initiate(order: PaymentOrder): Promise<PaymentInitiation> {
    const ref = `MOCK-${Date.now()}`;
    return {
      redirectUrl: `/checkout/success?orderId=${order.id}&ref=${ref}`,
      token: ref,
    };
  }

  async verify(token: string): Promise<PaymentVerification> {
    return { success: true, reference: token };
  }
}
