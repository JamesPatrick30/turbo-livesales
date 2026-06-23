import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { orderStatusUpdateRequest } from '@repo/types';
export class UpdateStatusDto implements orderStatusUpdateRequest {
    @IsString()
    @IsNotEmpty()
    @IsEnum(['PENDING', 'PREPARING', 'READY', 'SERVED', 'VOID'])
    newStatus!: string;

    @IsString()
    @IsNotEmpty()
    orderId!: string;
}