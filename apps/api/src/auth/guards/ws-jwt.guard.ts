import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    console.log(`[WsJwtGuard] canActivate fired — socket: ${client.id}`);

    const token = this.extractFromCookie(client);

    if (!token) {
      console.log(`[WsJwtGuard] ❌ No accessToken cookie found for socket: ${client.id}`);
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        id: string;
        role: string;
        email: string;
        OwnerId?: string;
      }>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      client.data.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        OwnerId: payload.role === 'ADMIN' ? payload.id : payload.OwnerId,
      };

      console.log(`[WsJwtGuard] ✅ Authenticated socket: ${client.id}`, client.data.user);

      return true;
    } catch (err: any) {
      console.log(
        `[WsJwtGuard] ❌ Token verification failed for socket: ${client.id}`,
        err.message,
      );
      throw new WsException('Unauthorized');
    }
  }

  private extractFromCookie(client: Socket): string | null {
    const rawCookie = client.handshake.headers.cookie;

    console.log('[WsJwtGuard] raw cookie header:', rawCookie);

    if (!rawCookie) return null;

    const cookies = cookie.parse(rawCookie);

    return cookies.accessToken ?? null;
  }
}