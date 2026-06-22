import { Controller, Post, UseGuards, Body, Req, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { CreateSaleDto } from './dtos/create-sale.dto';
import { SalesService } from './sales.service';
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('')
  async getSales(@Req() req: Request) {
    const adminOwnerId: string = ( req.user as any).role === "admin" ? ( req.user as any).id : ( req.user as any).OwnerId;
    return this.salesService.getSales(adminOwnerId);
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
}
