export interface PaymentOrder {
  id: string;
  amount: number;
  userId: string;
}

export interface PaymentInitiation {
  redirectUrl?: string;
  token?: string;
}

export interface PaymentVerification {
  success: boolean;
  reference: string;
}

export interface PaymentProvider {
  name: string;
  initiate(order: PaymentOrder): Promise<PaymentInitiation>;
  verify(token: string): Promise<PaymentVerification>;
}
