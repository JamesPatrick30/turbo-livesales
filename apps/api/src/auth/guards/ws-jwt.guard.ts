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


    const token = this.extractFromCookie(client);

    if (!token) {
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


      return true;
    } catch (err: any) {

      throw new WsException('Unauthorized');
    }
  }

  private extractFromCookie(client: Socket): string | null {
    const rawCookie = client.handshake.headers.cookie;


    if (!rawCookie) return null;

    const cookies = cookie.parse(rawCookie);

    return cookies.accessToken ?? null;
  }
}