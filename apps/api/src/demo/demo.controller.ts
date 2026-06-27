// demo/demo.controller.ts
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { DemoStoreService } from './demo-store.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { DemoAllowed } from './demo-allowed.decorator';
@UseGuards(AdminGuard)
@Controller('demo')
export class DemoController {
  constructor(
    private readonly simulation: SimulationService,
    private readonly demoStore: DemoStoreService,
  ) {}

  @Post('simulate/start')
  @DemoAllowed()
  async start(@Req() req: any) {
    // only run if demo mode is enabled, otherwise return an error
    if (!process.env.DEMO_MODE || process.env.DEMO_MODE !== 'true') {
      return { running: false, message: 'Demo mode is not enabled' };
    }
    console.log('Starting demo simulation for adminOwnerId:', req.user);
    const adminOwnerId = req.user.id; // same as your real controllers
    return this.simulation.start(adminOwnerId);
  }

  @Post('simulate/stop')
  @DemoAllowed()
  stop() {

    return this.simulation.stop();
  }

  @Get('simulate/status')
  status() {
    return { running: this.simulation.isRunning() };
  }

  @Post('reset')
  @DemoAllowed()
  async reset(@Req() req: any) {
    this.simulation.stop();
    this.demoStore.reset();
    return this.simulation.start(req.user.id);
  }
}