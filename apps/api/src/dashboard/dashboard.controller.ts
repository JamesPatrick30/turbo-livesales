// dashboard/dashboard.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DemoStoreService } from '../demo/demo-store.service';
import { ConfigService } from '@nestjs/config';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly demoStore: DemoStoreService,
    private readonly config: ConfigService,
  ) {}

  private get isDemo(): boolean {
    return this.config.get<string>('DEMO_MODE') === 'true';
  }

  private resolveAdminId(req: any): string {
    return req.user.role === 'admin' ? req.user.id : req.user.OwnerId;
  }

  @Get('metrics')
  getMetrics(@Request() req: any) {
    if (this.isDemo) return this.demoStore.getDemoMetrics();
    return this.dashboardService.getMetrics(this.resolveAdminId(req));
  }

  @Get('hourly-sales')
  getHourlySales(@Request() req: any) {
    if (this.isDemo) return this.demoStore.getDemoHourlySales();
    return this.dashboardService.getHourlySales(this.resolveAdminId(req));
  }

  @Get('top-items')
  getTopItems(@Request() req: any) {
    if (this.isDemo) return this.demoStore.getDemoTopItems();
    return this.dashboardService.getTopItems(this.resolveAdminId(req));
  }

  @Get('active-orders')
  getActiveOrders(@Request() req: any) {
    if (this.isDemo) return this.demoStore.getDemoActiveOrders();
    return this.dashboardService.getActiveOrders(this.resolveAdminId(req));
  }
}