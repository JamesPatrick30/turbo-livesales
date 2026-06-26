// src/demo/demo.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DemoStoreService } from './demo-store.service';
import { DemoModeGuard } from './demo-mode.guard';
import { DemoModeInterceptor } from './demo-mode.interceptor';

@Global() // so DemoStoreService is injectable everywhere
@Module({
  imports: [ConfigModule],
  providers: [DemoStoreService, DemoModeGuard, DemoModeInterceptor],
  exports: [DemoStoreService, DemoModeGuard, DemoModeInterceptor],
})

export class DemoModule {}