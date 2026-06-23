import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
@Injectable()
export class RealtimeService {

    constructor(private readonly client: RealtimeGateway) {}
    // getOrders(OwnerId: string) {
    //     // Implement your logic to fetch orders based on the OwnerId
    //     // For example, you might query a database or call another service
    //     // Here, we'll just return a mock response for demonstration purposes
    //     return [
    //         { orderId: '1', ownerId: OwnerId, item: 'Item 1', quantity: 2 },
    //         { orderId: '2', ownerId: OwnerId, item: 'Item 2', quantity: 1 },
    //     ];
    // }

    emit(event: string, data: any, room?: string) {
        if (room) {
            this.client.server.to(room).emit(event, data);
        } else {
            this.client.server.emit(event, data);
        }
    }
}
