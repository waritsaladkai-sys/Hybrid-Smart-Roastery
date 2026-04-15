import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateGreenBeanDto } from './dto/create-green-bean.dto';
import { CreateRoastJobDto } from './dto/create-roast-job.dto';
import { CompleteRoastJobDto } from './dto/complete-roast-job.dto';
import { RoastLevel } from '@prisma/client';

// Degas days by roast level (configurable via SystemConfig)
const DEFAULT_DEGAS_DAYS: Record<RoastLevel, number> = {
  LIGHT: 10,
  MEDIUM_LIGHT: 8,
  MEDIUM: 7,
  MEDIUM_DARK: 5,
  DARK: 4,
};

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ─── Green Bean ─────────────────────────────────────────────────────────────

  async receiveGreenBeans(dto: CreateGreenBeanDto) {
    return this.prisma.inventoryGreen.create({
      data: {
        batchRef: dto.batchRef,
        origin: dto.origin,
        region: dto.region,
        process: dto.process,
        moisturePercent: dto.moisturePercent,
        weightKg: dto.weightKg,
        initialWeightKg: dto.weightKg,
        minThresholdKg: dto.minThresholdKg ?? 5.0,
        pricePerKg: dto.pricePerKg,
        supplier: dto.supplier,
        notes: dto.notes,
        receivedAt: new Date(dto.receivedAt ?? Date.now()),
      },
    });
  }

  async getGreenBeans() {
    return this.prisma.inventoryGreen.findMany({
      orderBy: { receivedAt: 'asc' }, // FIFO order
      include: {
        _count: { select: { roastJobs: true } },
      },
    });
  }

  async getRoastedBeans(productId?: string) {
    return this.prisma.inventoryRoasted.findMany({
      where: productId ? { productId } : undefined,
      include: { product: { select: { sku: true, nameTh: true, roastLevel: true } } },
      orderBy: { roastDate: 'asc' }, // FIFO
    });
  }

  // ─── Roast Job Order ─────────────────────────────────────────────────────────

  async getDailyRoastPlan() {
    // รวม Pending orders มาคำนวณว่าต้องคั่วอะไร กี่กิโล
    const pendingItems = await this.prisma.orderItem.findMany({
      where: {
        order: { status: { in: ['PAID', 'ROASTING'] } },
        inventoryRoastedId: null, // ยังไม่มีสต๊อก
      },
      include: {
        product: { select: { sku: true, nameTh: true, roastLevel: true, origin: true } },
      },
    });

    // Group by product
    const plan = pendingItems.reduce(
      (acc, item) => {
        const key = item.productId;
        if (!acc[key]) {
          acc[key] = {
            product: item.product,
            totalQuantity: 0,
            totalWeightKg: 0,
          };
        }
        acc[key].totalQuantity += item.quantity;
        acc[key].totalWeightKg += (item.weightGram * item.quantity) / 1000;
        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(plan);
  }

  async createRoastJob(dto: CreateRoastJobDto, createdBy: string) {
    // Validate green bean stock (FIFO — ใช้ batch เก่าสุดก่อน)
    const greenBean = await this.prisma.inventoryGreen.findFirst({
      where: { id: dto.greenBeanId },
    });
    if (!greenBean) throw new NotFoundException('Green bean batch not found');
    if (greenBean.weightKg < dto.inputWeightKg) {
      throw new BadRequestException(
        `Insufficient green bean stock. Available: ${greenBean.weightKg}kg, Requested: ${dto.inputWeightKg}kg`,
      );
    }

    const yieldPercent = dto.yieldPercent ?? 85.0;
    const expectedOutputKg = parseFloat(
      (dto.inputWeightKg * (yieldPercent / 100)).toFixed(3),
    );

    // Generate job number
    const count = await this.prisma.roastJob.count();
    const jobNumber = `ECR-ROAST-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Deduct green bean stock (FIFO)
    await this.prisma.inventoryGreen.update({
      where: { id: dto.greenBeanId },
      data: { weightKg: { decrement: dto.inputWeightKg } },
    });

    return this.prisma.roastJob.create({
      data: {
        jobNumber,
        greenBeanId: dto.greenBeanId,
        inputWeightKg: dto.inputWeightKg,
        yieldPercent,
        expectedOutputKg,
        targetRoastLevel: dto.targetRoastLevel,
        scheduledAt: new Date(dto.scheduledAt),
        createdBy,
      },
    });
  }

  async completeRoastJob(id: string, dto: CompleteRoastJobDto) {
    const job = await this.prisma.roastJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Roast job not found');
    if (job.status === 'COMPLETED') {
      throw new BadRequestException('Roast job already completed');
    }

    const actualYieldPercent = parseFloat(
      ((dto.actualOutputKg / job.inputWeightKg) * 100).toFixed(2),
    );

    // Calculate degas ready date
    const degasConfig = await this.getSystemConfig('degas_days');
    const degasDays =
      degasConfig?.[dto.roastLevel] ?? DEFAULT_DEGAS_DAYS[dto.roastLevel];
    const degasReadyAt = new Date();
    degasReadyAt.setDate(degasReadyAt.getDate() + degasDays);

    // Generate roasted batch reference
    const batchRef = `ECR-ROASTED-${Date.now()}`;

    await this.prisma.$transaction([
      // Complete the job
      this.prisma.roastJob.update({
        where: { id },
        data: {
          actualOutputKg: dto.actualOutputKg,
          actualYieldPercent,
          status: 'COMPLETED',
          completedAt: new Date(),
          notes: dto.notes,
        },
      }),
      // Add roasted inventory for each product
      this.prisma.inventoryRoasted.create({
        data: {
          productId: dto.productId,
          batchRef,
          roastJobId: id,
          weightKg: dto.actualOutputKg,
          roastDate: new Date(),
          roastLevel: dto.roastLevel,
          degasReadyAt,
          notes: dto.notes,
        },
      }),
    ]);

    return {
      jobNumber: job.jobNumber,
      actualOutputKg: dto.actualOutputKg,
      actualYieldPercent,
      degasReadyAt,
      batchRef,
    };
  }

  // ─── Cron: Low Stock Alert ───────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_HOUR)
  async checkLowStock() {
    const lowStockBeans = await this.prisma.inventoryGreen.findMany({
      where: {
        weightKg: { lte: this.prisma.inventoryGreen.fields.minThresholdKg as any },
      },
    });

    // Simpler query
    const all = await this.prisma.inventoryGreen.findMany();
    const low = all.filter((b) => b.weightKg <= b.minThresholdKg);

    if (low.length > 0) {
      const message = `⚠️ Eight Coffee Roasters\nแจ้งเตือน: สต๊อกสารกาแฟต่ำกว่า Threshold\n\n${
        low
          .map(
            (b) =>
              `• ${b.origin} (${b.batchRef})\n  คงเหลือ: ${b.weightKg}kg\n  Threshold: ${b.minThresholdKg}kg`,
          )
          .join('\n\n')
      }\n\nกรุณาสั่งซื้อสารกาแฟเพิ่ม`;

      await this.notifications.pushToAdminGroup(message);
    }
  }

  // ─── System Config ────────────────────────────────────────────────────────────

  private async getSystemConfig(key: string) {
    const config = await this.prisma.systemConfig.findUnique({ where: { key } });
    return config?.value as any;
  }
}
