import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { RealtimeService } from './realtime.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as cookie from 'cookie';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL, // change to your frontend URL
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    // private readonly realtimeService: RealtimeService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {

    try {
      const cookieHeader = client.handshake.headers.cookie;

      if (!cookieHeader) {
        client.emit('error', 'Unauthorized');
        client.disconnect();
        return;
      }

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.accessToken;

      if (!token) {
        client.emit('error', 'Unauthorized');
        client.disconnect();
        return;
      }

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

      client.join(payload.OwnerId || payload.id); // Join a room based on OwnerId or user id
    } catch (err: any) {
      client.emit('error', 'Unauthorized');
      client.disconnect();
    }
  }
}