import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly lineApiUrl = 'https://api.line.me/v2/bot/message';

  constructor(private config: ConfigService) {}

  private get token() {
    return this.config.get<string>('LINE_CHANNEL_ACCESS_TOKEN');
  }

  private get adminGroupId() {
    return this.config.get<string>('LINE_ADMIN_GROUP_ID');
  }

  // ─── Push to Admin Group ──────────────────────────────────────────────────

  async pushToAdminGroup(message: string) {
    if (!this.adminGroupId) {
      this.logger.warn('LINE_ADMIN_GROUP_ID not configured — notification skipped');
      return;
    }
    return this.push(this.adminGroupId, message);
  }

  // ─── Push to User ──────────────────────────────────────────────────────────

  async pushOrderStatus(lineUserId: string, orderNumber: string, status: string) {
    const statusEmoji: Record<string, string> = {
      PAID: '✅',
      ROASTING: '🔥',
      READY_TO_SHIP: '📦',
      SHIPPED: '🚚',
      DELIVERED: '🎉',
      CANCELLED: '❌',
    };
    const emoji = statusEmoji[status] ?? '📋';
    const message = `${emoji} Eight Coffee Roasters\n\nOrder #${orderNumber}\nสถานะ: ${this.translateStatus(status)}\n\nขอบคุณที่ใช้บริการ ☕`;
    return this.push(lineUserId, message);
  }

  async pushPaymentConfirm(lineUserId: string, orderNumber: string, amount: number) {
    const message = `✅ ยืนยันการชำระเงิน\n\nOrder #${orderNumber}\nยอด: ฿${amount.toLocaleString()}\n\nเราจะดำเนินการส่งสินค้าโดยเร็ว ☕`;
    return this.push(lineUserId, message);
  }

  async pushLowStockAlert(items: { origin: string; batchRef: string; weightKg: number; minThresholdKg: number }[]) {
    const detail = items
      .map((i) => `• ${i.origin} (${i.batchRef})\n  คงเหลือ: ${i.weightKg}kg / Min: ${i.minThresholdKg}kg`)
      .join('\n');
    const message = `⚠️ แจ้งเตือนสต๊อกต่ำ\n\n${detail}\n\nกรุณาสั่งซื้อสารกาแฟเพิ่ม`;
    return this.pushToAdminGroup(message);
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private async push(to: string, text: string) {
    try {
      await axios.post(
        `${this.lineApiUrl}/push`,
        { to, messages: [{ type: 'text', text }] },
        { headers: { Authorization: `Bearer ${this.token}` } },
      );
      this.logger.log(`LINE push sent to ${to}`);
    } catch (error: any) {
      this.logger.error(`LINE push failed: ${error?.response?.data?.message ?? error.message}`);
    }
  }

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'รอชำระเงิน',
      PAID: 'ชำระเงินแล้ว',
      ROASTING: 'กำลังคั่ว',
      READY_TO_SHIP: 'พร้อมจัดส่ง',
      SHIPPED: 'จัดส่งแล้ว',
      DELIVERED: 'ส่งถึงแล้ว',
      CANCELLED: 'ยกเลิก',
    };
    return map[status] ?? status;
  }
}
