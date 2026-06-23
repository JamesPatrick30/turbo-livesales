import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
@Module({
  providers: [SalesService],
  controllers: [SalesController],
  imports: [AuthModule, PrismaModule, RealtimeModule]
})
export class SalesModule {}
