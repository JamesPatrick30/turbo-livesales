import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { CreateMenuItemDto, CreateMenuItemResponse } from '@repo/types';

export class CreateItemDto implements CreateMenuItemDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsNumber()
    price!: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsEnum(['AVAILABLE', 'UNAVAILABLE'])
    status?: 'AVAILABLE' | 'UNAVAILABLE';
}

export class CreateItemResponse implements CreateMenuItemResponse {
    @IsNotEmpty()
    @IsString()
    message!: string;

    @IsOptional()
    newItem?: {
        id: string;
        name: string;
        price: number;
        description?: string;
        category: string;
        status: 'AVAILABLE' | 'UNAVAILABLE';
    }
};