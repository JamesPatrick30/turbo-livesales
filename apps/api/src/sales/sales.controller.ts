import { Controller, Post, UseGuards, Body, Req, Get, Patch, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { CreateSaleDto } from './dtos/create-sale.dto';
import { SalesService } from './sales.service';
// dtos
import { UpdateStatusDto } from './dtos/updateStatus.dto';
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('')
  async getSales(@Req() req: Request) {
    const adminOwnerId: string = ( req.user as any).role === "admin" ? ( req.user as any).id : ( req.user as any).OwnerId;
    return this.salesService.getSales(adminOwnerId);
  }

  @Get('orders')
  async getOrders(@Req() req: Request) {
    const adminOwnerId: string = ( req.user as any).role === "admin" ? ( req.user as any).id : ( req.user as any).OwnerId;
    return this.salesService.getOrders(adminOwnerId);
  }

  @Post('create')
  async createSale(
      @Body() dto: CreateSaleDto,
      @Req() req: Request) {
      // Implement the logic to create a sale here
      const adminOwnerId = (req.user as any).OwnerId;  // This should be extracted from the authenticated user
      const cashierId = (req.user as any).id; // Assuming the authenticated user is the cashier
      return this.salesService.createSale(adminOwnerId, cashierId, dto);
  }

  @Patch('order/update/status')
  async updateOrderStatus(
      @Req() req: Request,
      @Body() body: UpdateStatusDto
  ) {
      const adminOwnerId = (req.user as any).OwnerId;
      return this.salesService.updateOrderStatus(adminOwnerId, body.orderId, body.newStatus);
  }

  @Get('history')
  async getHistory(@Req() req: Request) {
    const adminOwnerId = (req.user as any).OwnerId || (req.user as any).id; // Admins can view their own history, cashiers view their owner's history
    return this.salesService.getHistory(adminOwnerId);
  }

  @Patch(':orderId/recall')
  async recallOrder(
      @Req() req: Request,
      @Param('orderId') orderId: string
  ) {
    console.log(`Received request to recall order with ID: ${orderId}`);
      const adminOwnerId = (req.user as any).OwnerId;
      return this.salesService.recallOrder(orderId,adminOwnerId);
  }
}
