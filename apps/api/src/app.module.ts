import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UsersModule, ItemsModule], // Load .env and make it globally available
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
