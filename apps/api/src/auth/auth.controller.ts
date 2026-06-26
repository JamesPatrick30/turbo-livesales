import { Controller, Post, Body, Res, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import type { Response, Request } from 'Express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { Throttle } from '@nestjs/throttler';

// demo
import { DemoAllowed } from '../demo/demo-allowed.decorator';

//dtos
import { SignupDto, SignupResponseDto } from './dtos/signup.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({
    default: {
      limit: 5, // Allow 5 requests
      ttl: 60_000, // 1 minute
    }, // Allow 5 requests`
  }) // Limit to 5 requests per minute
  @DemoAllowed()  // Mark this endpoint as allowed to mutate data even in demo mode
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response  // ← add this
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.HandleLogin(body, res);
  }

  @Post('signup')
  @Throttle({
    default: {
      limit: 5, // Allow 5 requests
      ttl: 60_000, // 1 minute
    }, // Allow 5 requests`
  }) // Limit to 5 requests per minute
  signup(
    @Body() body: SignupDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<SignupResponseDto> {
    return this.authService.HandleSignup(body);
  }

  @Post('refresh')
  @DemoAllowed()  // Mark this endpoint as allowed to mutate data even in demo mode
  @UseGuards(RefreshGuard)
  refresh(
    @Res({ passthrough: true }) res: Response,  // ← and this
    @Req() req: Request
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = req.user as { id: string; email: string; role: string, OwnerId?: string };
    return this.authService.HandleRefresh(res,user);
  }

  @Post('logout')
  @DemoAllowed()  // Mark this endpoint as allowed to mutate data even in demo mode
  @UseGuards(JwtAuthGuard)
  logout(
    @Res({ passthrough: true }) res: Response  // ← and this
  ): Promise<{ message: string }> {
    return this.authService.HandleLogout(res);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request){
    return req.user as { id: string; email: string; role: string };
  }

  @Patch('update/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(@Req() req: Request, @Body() body: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const user = req.user as { id: string; email: string; role: string };
    return this.authService.HandleUpdatePassword(user.id, body.currentPassword, body.newPassword);
  }
}
