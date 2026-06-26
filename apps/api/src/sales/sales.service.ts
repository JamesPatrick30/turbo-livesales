import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RealtimeService } from '../realtime/realtime.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dtos/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService
  ) {}

  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return `${h} ${period}`;
  }
  private async generateReceiptNo(adminOwnerId: string): Promise<string> {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const datePart = `${year}${month}${day}`;

    const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const latestSale = await this.prisma.client.sales.findFirst({
      where: {
        adminOwnerId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        receiptNo: true,
      },
    });

    let nextSequence = 1;

    if (latestSale?.receiptNo) {
      const parts = latestSale.receiptNo.split('-');
      const lastSequence = Number(parts[2]);

      if (!Number.isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }

    const sequencePart = String(nextSequence).padStart(4, '0');

    return `LS-${datePart}-${sequencePart}`;
  }
  async getSales(adminOwnerId: string) {
    // Implement the logic to get sales here
    const sales = await this.prisma.client.sales.findMany({
      where: {
        adminOwnerId,
      },
      include: {
        adminOwnerId: false,
        cashierId: false,
        cashier: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          select: {
            name: true,
            quantity: true,
          },
        },
      },
    });

    return sales;
  }

  async getOrders(id: string){
    const orders = await this.prisma.client.sales.findMany({
      where: {
        adminOwnerId: id,
      },
      include: {
        adminOwnerId: false,
        cashierId: false,
        cashier: false,
        items: {
          select: {
            name: true,
            quantity: true,
            category: true
          },
        },
        total: false,
        paymentMethod: false
      },
    });

    return orders;
  }

  async createSale(adminOwnerId: string,cashierId: string, dto: CreateSaleDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Sale must contain at least one item.');
    }
    // 1) Validate cashier belongs to this admin and is really a cashier
    const cashier = await this.prisma.client.user.findFirst({
      where: {
        id: cashierId,
        role: 'CASHIER',
        adminOwnerId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!cashier) {
      throw new NotFoundException(
        'Cashier not found or not assigned to this admin.',
      );
    }

    // 2) Merge duplicate menu items
    const quantityMap = new Map<string, number>();

    for (const item of dto.items) {
      if (!item.menuItemId) {
        throw new BadRequestException('menuItemId is required.');
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new BadRequestException(
          `Invalid quantity for item ${item.menuItemId}`,
        );
      }

      quantityMap.set(
        item.menuItemId,
        (quantityMap.get(item.menuItemId) ?? 0) + item.quantity,
      );
    }

    const uniqueMenuItemIds = [...quantityMap.keys()];

    // 3) Fetch all menu items in one query
    const menuItems = await this.prisma.client.menuItem.findMany({
      where: {
        id: { in: uniqueMenuItemIds },
        adminOwnerId,
        status: 'AVAILABLE',
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
      },
    });

    if (menuItems.length !== uniqueMenuItemIds.length) {
      const foundIds = new Set(menuItems.map((item) => item.id));
      const missingIds = uniqueMenuItemIds.filter((id) => !foundIds.has(id));

      throw new BadRequestException(
        `Some menu items are missing, unavailable, or do not belong to this admin: ${missingIds.join(', ')}`,
      );
    }

    /**
     * 4) Build sale item snapshots + compute total
     * We compute in cents to avoid floating-point issues:
     * 99.50 -> 9950
     */
    let totalCents = 0;

    const saleItemsData = menuItems.map((menuItem) => {
      const quantity = quantityMap.get(menuItem.id)!;

      // Prisma Decimal usually serializes fine with Number() / toString()
      const unitPrice = Number(menuItem.price);

      if (Number.isNaN(unitPrice)) {
        throw new BadRequestException(
          `Invalid price for menu item ${menuItem.id}`,
        );
      }

      const unitPriceCents = Math.round(unitPrice * 100);
      const lineTotalCents = unitPriceCents * quantity;
      const lineTotal = lineTotalCents / 100;

      totalCents += lineTotalCents;

      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        unitPrice, // Prisma can accept number for Decimal fields
        quantity,
        category: menuItem.category, // keep because your schema uses category
        lineTotal,
      };
    });

    const total = totalCents / 100;

    // 5) Create sale + items inside a transaction
    const sale = await this.prisma.client.$transaction(async (tx) => {
      const createdSale = await tx.sales.create({
        data: {
          adminOwnerId,
          cashierId,
          paymentMethod: dto.paymentMethod,
          receiptNo: await this.generateReceiptNo(adminOwnerId),

          // IMPORTANT: use the exact field names from your schema
          Ordertype: dto.orderType,
          orderstatus: 'PENDING',

          total,
          items: {
            create: saleItemsData,
          },
        },
        include: {
          cashier: {
            select: {
              id: true,
              name: true,
            },
          },
          items: true,
        },
      });

      return createdSale;
    });

    this.realtimeService.emit("newOrder", {sale}, adminOwnerId); // Emit to the specific admin's room
    // this.realtimeService.emit("newOrder", {sale}); // Emit to the specific admin's room
    
    return {
      message: 'Sale created successfully',
      data: sale,
    };
  }

  async updateOrderStatus(adminOwnerId: string, orderId: string, newStatus: string) {
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'VOID'];

    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestException('Invalid order status.');
    }

    const sale = await this.prisma.client.sales.findUnique({
      where: {
        id: orderId,
        adminOwnerId,
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found.');
    }

    if (newStatus === 'READY' && !sale.readyAt) {
      const updatedSale = await this.prisma.client.sales.update({
        where: {
          id: orderId,
          adminOwnerId,
        },
        data: {
          orderstatus: newStatus,
          readyAt: new Date(),
        },
      });
      this.realtimeService.emit("orderStatusUpdated", {id: updatedSale.id, orderstatus: updatedSale.orderstatus}, adminOwnerId); // Emit to the specific admin's room

      return {
        message: 'Order status updated to READY with timestamp.',
        data: updatedSale,
      };
    }
    const updatedSale = await this.prisma.client.sales.update({
      where: {
        id: orderId,
        adminOwnerId,
      },
      data: {
        orderstatus: newStatus,
      },
    });
    this.realtimeService.emit("orderStatusUpdated", {id: updatedSale.id, orderstatus: updatedSale.orderstatus}, adminOwnerId); // Emit to the specific admin's room

    return {
      message: 'Order status updated successfully',
      data: updatedSale,
    };
  }

  async getHistory(adminOwnerId: string) {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const dayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const orders = await this.prisma.client.sales.findMany({
      where: {
        adminOwnerId,
        orderstatus: { in: ["READY", "SERVED"] },
        createdAt: { gte: dayStart, lte: dayEnd },
      },
      include: {
        items: {
          select: {
            name: true,
            quantity: true,
          },
        },
      },
      orderBy: { readyAt: 'desc' },
    });

    // ── Stats Computation ──────────────────────────────────────────
    const fulfilled = orders.length;

    // Avg prep time in minutes (createdAt → readyAt)
    const ordersWithReadyAt = orders.filter((o) => o.readyAt);
    const avgPrepMinutes =
      ordersWithReadyAt.length > 0
        ? ordersWithReadyAt.reduce((sum, o) => {
            const diff =
              (o.readyAt!.getTime() - o.createdAt.getTime()) / 1000 / 60;
            return sum + diff;
          }, 0) / ordersWithReadyAt.length
        : 0;

    // Peak speed hour: group by hour of readyAt, find hour with most orders
    const hourBuckets: Record<number, number> = {};
    for (const o of ordersWithReadyAt) {
      const hour = o.readyAt!.getHours();
      hourBuckets[hour] = (hourBuckets[hour] ?? 0) + 1;
    }
    const peakHour =
      Object.keys(hourBuckets).length > 0
        ? Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    const peakHourLabel = peakHour
      ? this.formatHour(Number(peakHour))
      : 'N/A';

    // Avg prep time during peak hour
    const peakHourOrders = ordersWithReadyAt.filter(
      (o) => o.readyAt!.getHours() === Number(peakHour),
    );
    const peakAvgPrep =
      peakHourOrders.length > 0
        ? peakHourOrders.reduce((sum, o) => {
            return (
              sum +
              (o.readyAt!.getTime() - o.createdAt.getTime()) / 1000 / 60
            );
          }, 0) / peakHourOrders.length
        : 0;

    return {
      stats: {
        fulfilled,
        avgPrepMinutes: Math.round(avgPrepMinutes * 10) / 10,
        peakHour: peakHourLabel,
        peakAvgPrepMinutes: Math.round(peakAvgPrep * 10) / 10,
      },
      orders: orders.map((o) => ({
        id: o.id,
        receiptNo: o.receiptNo,
        Ordertype: o.Ordertype,
        orderstatus: o.orderstatus,
        readyAt: o.readyAt,
        createdAt: o.createdAt,
        prepTime:
          o.readyAt
            ? `${Math.round(
                (o.readyAt.getTime() - o.createdAt.getTime()) / 1000 / 60,
              )} min`
            : '—',
        items: o.items,
      })),
    };
  }

  async cashierHistory(adminOwnerId: string) {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const dayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const orders = await this.prisma.client.sales.findMany({
      where: {
        adminOwnerId,
        orderstatus: { in: ["READY", "SERVED"] },
        createdAt: { gte: dayStart, lte: dayEnd },
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
      orderBy: { readyAt: 'desc' },
    });

      
    // ── Stats Computation ──────────────────────────────────────────
    const fulfilled = orders.length;

    // Avg prep time in minutes (createdAt → readyAt)
    const ordersWithReadyAt = orders.filter((o) => o.readyAt);
    const avgPrepMinutes =
      ordersWithReadyAt.length > 0
        ? ordersWithReadyAt.reduce((sum, o) => {
            const diff =
              (o.readyAt!.getTime() - o.createdAt.getTime()) / 1000 / 60;
            return sum + diff;
          }, 0) / ordersWithReadyAt.length
        : 0;

    // Peak speed hour: group by hour of readyAt, find hour with most orders
    const hourBuckets: Record<number, number> = {};
    for (const o of ordersWithReadyAt) {
      const hour = o.readyAt!.getHours();
      hourBuckets[hour] = (hourBuckets[hour] ?? 0) + 1;
    }
    const peakHour =
      Object.keys(hourBuckets).length > 0
        ? Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    const peakHourLabel = peakHour
      ? this.formatHour(Number(peakHour))
      : 'N/A';

    // Avg prep time during peak hour
    const peakHourOrders = ordersWithReadyAt.filter(
      (o) => o.readyAt!.getHours() === Number(peakHour),
    );
    const peakAvgPrep =
      peakHourOrders.length > 0
        ? peakHourOrders.reduce((sum, o) => {
            return (
              sum +
              (o.readyAt!.getTime() - o.createdAt.getTime()) / 1000 / 60
            );
          }, 0) / peakHourOrders.length
        : 0;

    return {
      stats: {
        fulfilled,
        avgPrepMinutes: Math.round(avgPrepMinutes * 10) / 10,
        peakHour: peakHourLabel,
        peakAvgPrepMinutes: Math.round(peakAvgPrep * 10) / 10,
      },
      orders: orders.map((o) => ({
        id: o.id,
        receiptNo: o.receiptNo,
        total: o.total.toNumber(),
        Ordertype: o.Ordertype,
        orderstatus: o.orderstatus,
        readyAt: o.readyAt,
        createdAt: o.createdAt,
        prepTime:
          o.readyAt
            ? `${Math.round(
                (o.readyAt.getTime() - o.createdAt.getTime()) / 1000 / 60,
              )} min`
            : '—',
        items: o.items,
      })),
    };
  }
  async recallOrder(orderId: string, adminOwnerId: string) {
    const order = await this.prisma.client.sales.findFirst({
      where: { id: orderId, adminOwnerId },
    });

    if (!order) throw new NotFoundException('Order not found');

    const updatedSale = await this.prisma.client.sales.update({
      where: { id: orderId },
      data: {
        orderstatus: "PREPARING",
        readyAt: null, // clear readyAt so prep time resets
      },
    });
    const sale = await this.prisma.client.sales.findUnique({
      where: { id: orderId },
      include: {
        cashier: {
            select: {
              id: true,
              name: true,
            },
          },
          items: true,
      },
    });
    this.realtimeService.emit("newOrder", {sale}, adminOwnerId); // Emit to the specific admin's room
    return updatedSale;
  }

  async getActiveOrders(adminOwnerId: string) {
    return this.prisma.client.sales.findMany({
      where: {
        adminOwnerId,
        orderstatus: { in: ["PENDING", "PREPARING", "READY"] },
      },
      select:{
        id:true,
        receiptNo: true,
        Ordertype: true,
        orderstatus:true,
        total: true,
        createdAt:true,
        items: {
          select: {
            id:true,
            name: true,
            quantity: true,
            unitPrice: true,
          },
        }
      }
    });
  }
}