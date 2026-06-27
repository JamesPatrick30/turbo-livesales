// src/demo/demo.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DemoStoreService } from './demo-store.service';
import { DemoModeGuard } from './demo-mode.guard';
import { DemoModeInterceptor } from './demo-mode.interceptor';
import { RealtimeModule } from '../realtime/realtime.module';
import { AuthModule } from '../auth/auth.module';

import { SimulationService } from './simulation.service';
import { DemoController } from './demo.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
@Global() // so DemoStoreService is injectable everywhere
@Module({
  imports: [ConfigModule, RealtimeModule, AuthModule, PrismaModule],
  controllers: [DemoController],
  providers: [DemoStoreService, DemoModeGuard, DemoModeInterceptor, SimulationService, DemoController],
  exports: [DemoStoreService, DemoModeGuard, DemoModeInterceptor],
})

export class DemoModule {}