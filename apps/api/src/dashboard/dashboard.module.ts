import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../prisma/prisma.module'; // adjust to however you import prisma
@Module({
  imports: [PrismaModule],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
