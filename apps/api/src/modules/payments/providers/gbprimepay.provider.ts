import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { PaymentProvider } from '../payment.provider.interface';

/**
 * GB Prime Pay Provider — เปิดใช้เมื่อได้ Merchant Account
 * สลับโดยเปลี่ยน useClass ใน PaymentsModule
 */
@Injectable()
export class GBPrimepayProvider implements PaymentProvider {
  private readonly logger = new Logger('GBPrimepayProvider');

  constructor(private config: ConfigService) {}

  private get publicKey() { return this.config.get<string>('GBPAY_PUBLIC_KEY'); }
  private get token() { return this.config.get<string>('GBPAY_TOKEN'); }
  private get apiUrl() { return this.config.get<string>('GBPAY_API_URL', 'https://api.gbprimepay.com'); }

  async createQrPayment(params: {
    orderId: string;
    orderNumber: string;
    amount: number;
  }) {
    const referenceNo = params.orderNumber;
    const amountInSatang = Math.round(params.amount * 100);

    const { data } = await axios.post(
      `${this.apiUrl}/v3/qrcode`,
      {
        token: this.token,
        amount: amountInSatang,
        referenceNo,
        backgroundUrl: `${this.config.get('NEXT_PUBLIC_SITE_URL')}/api/webhooks/gbpay`,
        detail: `Eight Coffee Roasters — ${referenceNo}`,
        customerName: 'Customer',
      },
    );

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    return { qrData: data.qrcode, referenceNo, expiresAt };
  }

  verifyWebhook(payload: any, signature: string): boolean {
    const rawData = `${payload.referenceNo}${payload.amount}${payload.resultCode}${this.publicKey}`;
    const expected = crypto.createHash('md5').update(rawData).digest('hex');
    return expected === signature;
  }
}
