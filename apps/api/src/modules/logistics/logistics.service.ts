import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LogisticsService {
  private readonly logger = new Logger(LogisticsService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private get flashApiUrl() { return this.config.get('FLASH_API_URL', 'https://api.flashexpress.co.th'); }
  private get flashApiKey() { return this.config.get('FLASH_API_KEY'); }

  // ─── Get shipping rates ───────────────────────────────────────────────────

  async getRates(params: { weightKg: number; toPostalCode: string }) {
    try {
      const { data } = await axios.post(
        `${this.flashApiUrl}/open/v1/routes`,
        {
          mchId: this.flashApiKey,
          weight: params.weightKg * 1000, // กรัม
          toPostalCode: params.toPostalCode,
        },
      );
      return data;
    } catch {
      // Return mock rate if Flash API not configured
      this.logger.warn('Flash Express API not configured — returning mock rate');
      return {
        carrier: 'FLASH_EXPRESS',
        price: this.calculateMockRate(params.weightKg),
        estimatedDays: '1-2 วันทำการ',
      };
    }
  }

  // ─── Book shipment ────────────────────────────────────────────────────────

  async bookShipment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        items: true,
        user: { select: { name: true, phone: true } },
      },
    });

    if (!order?.address) throw new BadRequestException('Order has no shipping address');

    const totalWeightKg =
      order.items.reduce((sum, i) => sum + i.weightGram, 0) / 1000;

    try {
      const { data } = await axios.post(
        `${this.flashApiUrl}/open/v1/orders`,
        {
          mchId: this.flashApiKey,
          //  Flash Express API body
          toName: order.address.fullName,
          toPhone: order.address.phone,
          toAddress: order.address.address,
          toDistrict: order.address.district,
          toProvince: order.address.province,
          toPostcode: order.address.postalCode,
          weight: Math.max(totalWeightKg * 1000, 200), // min 200g
          codAmount: 0,
          mchOrderNo: order.orderNumber,
        },
      );

      const trackingNo = data.sortingCode || data.trackingNo;

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          trackingNo,
          logisticsProvider: 'FLASH_EXPRESS',
          flashAwbUrl: data.awbUrl,
        },
      });

      return { trackingNo, awbUrl: data.awbUrl };
    } catch (err: any) {
      // Mock response for dev
      this.logger.warn('Flash API unavailable — using mock tracking');
      const mockTracking = `TH${Date.now()}`;
      await this.prisma.order.update({
        where: { id: orderId },
        data: { trackingNo: mockTracking, logisticsProvider: 'FLASH_EXPRESS' },
      });
      return { trackingNo: mockTracking, awbUrl: null };
    }
  }

  // ─── Track shipment ───────────────────────────────────────────────────────

  async track(trackingNo: string) {
    const trackingUrl = `https://www.flashexpress.co.th/tracking/?se=${trackingNo}`;
    try {
      const { data } = await axios.get(
        `${this.flashApiUrl}/open/v1/orders/${trackingNo}/tracks`,
        { headers: { mchId: this.flashApiKey } },
      );
      return { ...data, trackingUrl };
    } catch {
      return { trackingNo, trackingUrl, status: 'PENDING', events: [] };
    }
  }

  private calculateMockRate(weightKg: number): number {
    if (weightKg <= 0.5) return 40;
    if (weightKg <= 1) return 55;
    if (weightKg <= 2) return 70;
    return 70 + Math.ceil(weightKg - 2) * 20;
  }
}
