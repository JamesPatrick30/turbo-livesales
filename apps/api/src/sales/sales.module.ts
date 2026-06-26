import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';

import { DemoModule } from '../demo/demo.module';  // Import the DemoModule
@Module({
  providers: [SalesService],
  controllers: [SalesController],
  imports: [AuthModule, PrismaModule, RealtimeModule, DemoModule]
})
export class SalesModule {}
