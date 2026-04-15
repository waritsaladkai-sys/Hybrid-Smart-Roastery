import { Controller, Post, Body, Param, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders/:orderId/initiate')
  @ApiOperation({ summary: 'สร้าง PromptPay QR Code สำหรับ Order' })
  initiatePayment(@Param('orderId') orderId: string) {
    return this.paymentsService.initiatePayment(orderId);
  }
}

// Separate controller for webhooks (no auth — GB Pay calls this)
@ApiTags('Payments')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('gbpay')
  @ApiOperation({ summary: 'GB Prime Pay Webhook (ไม่ต้องใส่ Auth)' })
  gbpayWebhook(
    @Body() payload: any,
    @Headers('x-gbp-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }
}
