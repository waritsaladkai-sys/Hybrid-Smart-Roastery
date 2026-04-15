import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

// Valid state transitions
const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PAYMENT: [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID: [OrderStatus.ROASTING, OrderStatus.READY_TO_SHIP, OrderStatus.CANCELLED],
  ROASTING: [OrderStatus.READY_TO_SHIP],
  READY_TO_SHIP: [OrderStatus.SHIPPED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Validate all products exist
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found or inactive');
    }

    // Fetch user tier for pricing
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isWholesale = user?.tier === 'WHOLESALE';

    // Calculate totals
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const prices = product.prices as any;
      const unitPrice = isWholesale ? prices.wholesale : prices.retail;
      return {
        productId: item.productId,
        quantity: item.quantity,
        weightGram: product.weightGram * item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + Number(i.totalPrice), 0);
    const totalAmount = subtotal + (dto.shippingFee ?? 0);

    // Generate order number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.order.count();
    const orderNumber = `ECR-${today}-${String(count + 1).padStart(4, '0')}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId: dto.addressId,
        isWholesale,
        subtotal,
        shippingFee: dto.shippingFee ?? 0,
        totalAmount,
        notes: dto.notes,
        items: {
          create: orderItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            weightGram: i.weightGram,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
          })),
        },
        statusLogs: {
          create: {
            toStatus: OrderStatus.PENDING_PAYMENT,
            note: 'Order created',
            actorId: userId,
          },
        },
      },
      include: { items: true },
    });

    return order;
  }

  async findAll(status?: OrderStatus, userId?: string) {
    return this.prisma.order.findMany({
      where: {
        ...(status && { status }),
        ...(userId && { userId }),
      },
      include: {
        user: { select: { name: true, email: true, lineProfile: true } },
        items: { include: { product: { select: { sku: true, nameTh: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, lineUserId: true, lineProfile: true } },
        address: true,
        items: {
          include: {
            product: true,
            inventoryRoasted: { select: { batchRef: true, roastDate: true, degasReadyAt: true } },
          },
        },
        statusLogs: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async transition(id: string, toStatus: OrderStatus, actorId: string, note?: string) {
    const order = await this.findOne(id);
    const allowed = VALID_TRANSITIONS[order.status] ?? [];

    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${toStatus}`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id },
        data: { status: toStatus },
      }),
      this.prisma.orderStatusLog.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus,
          note,
          actorId,
        },
      }),
    ]);

    // Notify customer via LINE (if they have LINE account)
    if (order.user.lineUserId) {
      await this.notifications.pushOrderStatus(
        order.user.lineUserId,
        order.orderNumber,
        toStatus,
      );
    }

    return updated;
  }

  async markPaid(id: string, gbpayRef: string, paidAmount: number) {
    const order = await this.findOne(id);

    await this.prisma.order.update({
      where: { id },
      data: {
        gbpayRef,
        paidAmount,
        paidAt: new Date(),
      },
    });

    // Check if all items have roasted stock → set READY_TO_SHIP, else ROASTING
    const allInStock = order.items.every((item) => item.inventoryRoastedId);
    const nextStatus = allInStock ? OrderStatus.READY_TO_SHIP : OrderStatus.ROASTING;

    await this.transition(id, OrderStatus.PAID, 'system', `GB Pay ref: ${gbpayRef}`);
    if (nextStatus !== OrderStatus.PAID) {
      await this.transition(id, nextStatus, 'system', 'Auto status after payment');
    }

    // Notify customer
    if (order.user.lineUserId) {
      await this.notifications.pushPaymentConfirm(
        order.user.lineUserId,
        order.orderNumber,
        paidAmount,
      );
    }

    return this.findOne(id);
  }
}
