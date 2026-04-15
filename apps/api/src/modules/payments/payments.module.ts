import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController, WebhooksController } from './payments.controller';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { GBPrimepayProvider } from './providers/gbprimepay.provider';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [PaymentsService, MockPaymentProvider, GBPrimepayProvider],
  controllers: [PaymentsController, WebhooksController],
})
export class PaymentsModule {}
