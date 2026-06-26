// sales/sales.controller.ts
import { Controller, Post, UseGuards, Body, Req, Get, Patch, Param, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { CreateSaleDto } from './dtos/create-sale.dto';
import { SalesService } from './sales.service';
import { UpdateStatusDto } from './dtos/updateStatus.dto';
import { DemoAllowed } from '../demo/demo-allowed.decorator';
import { DemoStoreService } from '../demo/demo-store.service';
import { ConfigService } from '@nestjs/config';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly demoStore: DemoStoreService,
    private readonly config: ConfigService,
  ) {}

  private get isDemo(): boolean {
    return this.config.get<string>('DEMO_MODE') === 'true';
  }

  // ── GET /sales ────────────────────────────────────────────────────
  @Get()
  async getSales(@Req() req: Request) {
    const adminOwnerId = this.resolveAdminId(req);
    if (this.isDemo) return this.demoStore.getSales(adminOwnerId);
    return this.salesService.getSales(adminOwnerId);
  }

  // ── GET /sales/orders ─────────────────────────────────────────────
  @Get('orders')
  async getOrders(@Req() req: Request) {
    const adminOwnerId = this.resolveAdminId(req);
    if (this.isDemo) return this.demoStore.getOrders(adminOwnerId);
    return this.salesService.getOrders(adminOwnerId);
  }

  // ── GET /sales/active-orders ──────────────────────────────────────
  @Get('active-orders')
  async getActiveOrders(@Req() req: Request) {
    const adminOwnerId = this.resolveOwnerId(req);
    if (this.isDemo) return this.demoStore.getActiveOrders(adminOwnerId);
    return this.salesService.getActiveOrders(adminOwnerId);
  }

  // ── GET /sales/history ────────────────────────────────────────────
  @Get('history')
  async getHistory(@Req() req: Request) {
    const adminOwnerId = this.resolveAdminId(req);
    if (this.isDemo) return this.demoStore.getHistory(adminOwnerId);
    return this.salesService.getHistory(adminOwnerId);
  }

  // ── GET /sales/history/cashier ────────────────────────────────────
  @Get('history/cashier')
  async getHistoryCashier(@Req() req: Request) {
    const adminOwnerId = this.resolveAdminId(req);
    if (this.isDemo) return this.demoStore.getHistory(adminOwnerId); // same shape
    return this.salesService.cashierHistory(adminOwnerId);
  }

  // ── POST /sales/create ────────────────────────────────────────────
  @Post('create')
  @DemoAllowed()
  async createSale(@Body() dto: CreateSaleDto, @Req() req: Request) {
    const adminOwnerId = this.resolveOwnerId(req);
    const cashierId = (req.user as any).id;

    if (this.isDemo) {
      const order = this.demoStore.addOrder(dto, adminOwnerId, cashierId);
      return { message: 'Demo sale created successfully', data: order };
    }

    return this.salesService.createSale(adminOwnerId, cashierId, dto);
  }

  // ── PATCH /sales/order/update/status ─────────────────────────────
  @Patch('order/update/status')
  @DemoAllowed()
  async updateOrderStatus(@Req() req: Request, @Body() body: UpdateStatusDto) {
    const adminOwnerId = this.resolveOwnerId(req);

    if (this.isDemo) {
      const result = this.demoStore.updateOrderStatus(body.orderId, body.newStatus);
      if (!result) throw new NotFoundException('Demo order not found.');
      return result;
    }

    return this.salesService.updateOrderStatus(adminOwnerId, body.orderId, body.newStatus);
  }

  // ── PATCH /sales/:orderId/recall ──────────────────────────────────
  @Patch(':orderId/recall')
  @DemoAllowed()
  async recallOrder(@Req() req: Request, @Param('orderId') orderId: string) {
    const adminOwnerId = this.resolveOwnerId(req);

    if (this.isDemo) {
      const result = this.demoStore.recallOrder(orderId);
      if (!result) throw new NotFoundException('Demo order not found.');
      return result;
    }

    return this.salesService.recallOrder(orderId, adminOwnerId);
  }

  // ── Helpers ───────────────────────────────────────────────────────
  private resolveAdminId(req: Request): string {
    const user = req.user as any;
    return user.role === 'admin' ? user.id : user.OwnerId;
  }

  private resolveOwnerId(req: Request): string {
    return (req.user as any).OwnerId;
  }
}