import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider } from './payment.provider.interface';

/**
 * Mock Payment Provider — ใช้ระหว่าง Development
 * สลับเป็น GBPrimepayProvider เมื่อได้ Merchant Account
 */
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger('MockPaymentProvider');

  async createQrPayment(params: {
    orderId: string;
    orderNumber: string;
    amount: number;
  }) {
    this.logger.log(`[MOCK] Creating QR for order ${params.orderNumber} — ฿${params.amount}`);

    const referenceNo = `MOCK-${params.orderNumber}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Mock QR data (in production this would be a real PromptPay QR payload from GB Pay)
    const qrData = `MOCK_QR::${referenceNo}::${params.amount}`;

    return { qrData, referenceNo, expiresAt };
  }

  verifyWebhook(payload: any, signature: string): boolean {
    this.logger.log('[MOCK] Webhook verified (always true in mock mode)');
    return true; // always pass in dev
  }
}
