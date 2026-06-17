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
  providers: [AuthService, JwtStrategy, AdminStrategy, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtStrategy, AdminStrategy, JwtAuthGuard, AdminGuard],  // Export AuthService, JwtModule, and JwtAuthGuard for use in other modules
})
export class AuthModule {}