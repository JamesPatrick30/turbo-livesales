import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [demoConfig],
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minute
        limit: 100,  // 100 requests per minute per IP
      },
    ]),

    AuthModule,
    PrismaModule,
    UsersModule,
    ItemsModule,
    SalesModule,
    RealtimeModule,
    DashboardModule,
    DemoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Demo mode guard
    {
      provide: APP_GUARD,
      useClass: DemoModeGuard,
    },

    // Rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Demo mode interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: DemoModeInterceptor,
    },
  ],
})
export class AppModule {}