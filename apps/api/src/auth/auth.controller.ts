import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import type { Response } from 'Express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response  // ← add this
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.HandleLogin(body, res);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refresh(
    @Res({ passthrough: true }) res: Response  // ← and this
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.HandleRefresh(res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile() {
    return { message: 'This is a protected route' };
  }
}
