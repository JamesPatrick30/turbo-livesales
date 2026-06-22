import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dtos/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

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
        cathegory: menuItem.category, // keep because your schema uses cathegory
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

    return {
      message: 'Sale created successfully',
      data: sale,
    };
  }
}