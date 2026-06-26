import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { SalesModule } from './sales/sales.module';
import { RealtimeModule } from './realtime/realtime.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DemoModule } from './demo/demo.module';

import { DemoModeGuard } from './demo/demo-mode.guard';
import { DemoModeInterceptor } from './demo/demo-mode.interceptor';
import demoConfig from './config/demo.config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core/constants';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ load: [demoConfig], isGlobal: true }), PrismaModule, UsersModule, ItemsModule, SalesModule, RealtimeModule, DashboardModule, DemoModule], // Load .env and make it globally available
  controllers: [AppController],
  providers: [
    AppService,
    {provide: APP_GUARD, useClass: DemoModeGuard },       // runs on every route
    { provide: APP_INTERCEPTOR, useClass: DemoModeInterceptor }
  ],
})

export class AppModule {}
