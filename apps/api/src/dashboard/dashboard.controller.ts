import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  getMetrics(@Request() req: any) {
    const adminId = req.user.role === 'admin' ? req.user.id : req.user.OwnerId;
    return this.dashboardService.getMetrics(adminId);
  }

  @Get('hourly-sales')
  getHourlySales(@Request() req: any) {
    const adminId = req.user.role === 'admin' ? req.user.id : req.user.OwnerId;
    return this.dashboardService.getHourlySales(adminId);
  }

  @Get('top-items')
  getTopItems(@Request() req: any) {
    const adminId = req.user.role === 'admin' ? req.user.id : req.user.OwnerId;
    return this.dashboardService.getTopItems(adminId);
  }

  @Get('active-orders')
  getActiveOrders(@Request() req: any) {
    const adminId = req.user.role === 'admin' ? req.user.id : req.user.OwnerId;
    return this.dashboardService.getActiveOrders(adminId);
  }
}