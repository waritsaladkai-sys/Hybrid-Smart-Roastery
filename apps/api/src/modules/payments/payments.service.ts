import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { GBPrimepayProvider } from './providers/gbprimepay.provider';
import { PaymentProvider } from './payment.provider.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private provider: PaymentProvider;

  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private config: ConfigService,
    private mockProvider: MockPaymentProvider,
    private gbpayProvider: GBPrimepayProvider,
  ) {
    // Auto-select provider based on config
    const gbpayToken = this.config.get<string>('GBPAY_TOKEN');
    this.provider = gbpayToken === 'mock' ? this.mockProvider : this.gbpayProvider;
    this.logger.log(`Payment provider: ${gbpayToken === 'mock' ? 'MOCK' : 'GB Prime Pay'}`);
  }

  async initiatePayment(orderId: string) {
    const order = await this.ordersService.findOne(orderId);

    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(`Order is not in PENDING_PAYMENT status`);
    }

    const { qrData, referenceNo, expiresAt } = await this.provider.createQrPayment({
      orderId,
      orderNumber: order.orderNumber,
      amount: Number(order.totalAmount),
    });

    // Save QR data to order
    await this.prisma.order.update({
      where: { id: orderId },
      data: { gbpayQrData: qrData, paymentMethod: 'PROMPTPAY_QR' },
    });

    return {
      qrData,
      referenceNo,
      amount: order.totalAmount,
      expiresAt,
      orderNumber: order.orderNumber,
    };
  }

  async handleWebhook(payload: any, signature: string) {
    const isValid = this.provider.verifyWebhook(payload, signature);
    if (!isValid) {
      this.logger.warn('Invalid payment webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    // Find order by reference number
    const order = await this.prisma.order.findFirst({
      where: { orderNumber: payload.referenceNo },
    });

    if (!order) {
      this.logger.warn(`Order not found for ref: ${payload.referenceNo}`);
      return { received: true };
    }

    // GB Pay resultCode 00 = success
    if (payload.resultCode === '00') {
      await this.ordersService.markPaid(
        order.id,
        payload.referenceNo,
        Number(payload.amount) / 100, // satang → baht
      );
      this.logger.log(`Payment confirmed for order ${order.orderNumber}`);
    }

    return { received: true };
  }
}
