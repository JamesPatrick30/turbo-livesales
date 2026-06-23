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
    origin: 'http://localhost:5173', // change to your frontend URL
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
      // console.log('[WS] cookie header:', cookieHeader);

      if (!cookieHeader) {
        // console.log('[WS] No cookie header found');
        client.emit('error', 'Unauthorized');
        client.disconnect();
        return;
      }

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.accessToken;

      if (!token) {
        // console.log('[WS] No accessToken found');
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
    //   console.log('[WS] Authenticated user:', client.data.user);
    } catch (err: any) {
    //   console.log('[WS] Token verification failed:', err.message);
      client.emit('error', 'Unauthorized');
      client.disconnect();
    }
  }

  @SubscribeMessage('getOrders')
  async handleGetOrders(@ConnectedSocket() client: Socket) {
    const user = client.data.user;

    if (!user) {
      return { message: 'Unauthorized' };
    }

    const { OwnerId, id, role } = user;
    // //console.log(`User ${id} (${role}) requesting orders for OwnerId ${OwnerId}`);

    // return this.realtimeService.getOrders(OwnerId);
    return { message: 'Orders fetched successfully' };
  }
}