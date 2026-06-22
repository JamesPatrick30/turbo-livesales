import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdateMenuItemDto, UpdateMenuItemResponse } from '@repo/types'

export class UpdateMenuItemRequestDto implements UpdateMenuItemDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    status?: 'AVAILABLE' | 'UNAVAILABLE';
}

export class UpdateMenuItemResponseDto implements UpdateMenuItemResponse {
    @IsNotEmpty()
    @IsString()
    message!: string;

    @IsOptional()
    @IsString()
    updatedItem?: {
        id: string;
        name: string;
        price: number;
        description?: string;
        category: string;
        status: 'AVAILABLE' | 'UNAVAILABLE';
    };
}