import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../prisma/prisma.module'; // adjust to however you import prisma
import { DemoModule } from '../demo/demo.module'; // Import the DemoModule
@Module({
  imports: [PrismaModule, DemoModule],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
