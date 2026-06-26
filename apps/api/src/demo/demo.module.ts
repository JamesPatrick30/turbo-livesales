// src/demo/demo.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DemoStoreService } from './demo-store.service';
import { DemoModeGuard } from './demo-mode.guard';
import { DemoModeInterceptor } from './demo-mode.interceptor';
import { RealtimeModule } from '../realtime/realtime.module';
@Global() // so DemoStoreService is injectable everywhere
@Module({
  imports: [ConfigModule, RealtimeModule],
  providers: [DemoStoreService, DemoModeGuard, DemoModeInterceptor],
  exports: [DemoStoreService, DemoModeGuard, DemoModeInterceptor],
})

export class DemoModule {}