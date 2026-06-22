import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  providers: [SalesService],
  controllers: [SalesController],
  imports: [AuthModule, PrismaModule]
})
export class SalesModule {}
