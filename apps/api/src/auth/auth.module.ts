import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminGuard } from './guards/admin.guard';
import { AdminStrategy } from './strategies/admin.strategy';
import { WsJwtGuard } from './guards/ws-jwt.guard'
import { RefreshStrategy } from './strategies/refreshJWT.strategy';
import { RefreshGuard } from './guards/refresh.guard';
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [AuthService, WsJwtGuard, JwtStrategy, AdminStrategy, JwtAuthGuard, AdminGuard, RefreshStrategy, RefreshGuard],
  exports: [AuthService, WsJwtGuard , JwtStrategy, AdminStrategy, JwtAuthGuard, AdminGuard, JwtModule],  // Export AuthService, JwtModule, and JwtAuthGuard for use in other modules
})
export class AuthModule {}