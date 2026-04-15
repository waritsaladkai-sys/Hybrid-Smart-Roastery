// Payment Provider Interface — swap Mock → GB Prime Pay without changing other code
export interface PaymentProvider {
  createQrPayment(params: {
    orderId: string;
    orderNumber: string;
    amount: number;
  }): Promise<{ qrData: string; referenceNo: string; expiresAt: Date }>;

  verifyWebhook(payload: any, signature: string): boolean;
}
