import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';

@ApiTags('Logistics')
@ApiBearerAuth()
@Controller('v1/logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('rates')
  @ApiOperation({ summary: 'คำนวณค่าจัดส่ง Flash Express' })
  getRates(
    @Query('weightKg') weightKg: string,
    @Query('toPostalCode') toPostalCode: string,
  ) {
    return this.logisticsService.getRates({
      weightKg: parseFloat(weightKg),
      toPostalCode,
    });
  }

  @Post('orders/:orderId/book')
  @ApiOperation({ summary: 'จอง Flash Express Shipment' })
  bookShipment(@Param('orderId') orderId: string) {
    return this.logisticsService.bookShipment(orderId);
  }

  @Get('track/:trackingNo')
  @ApiOperation({ summary: 'ติดตามพัสดุ Flash Express' })
  track(@Param('trackingNo') trackingNo: string) {
    return this.logisticsService.track(trackingNo);
  }
}
