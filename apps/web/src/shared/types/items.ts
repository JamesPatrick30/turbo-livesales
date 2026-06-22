export interface MenuItem {
    id: string;
    name: string;
    price: number;
    description?: string;
    category: string;
    status: 'AVAILABLE' | 'UNAVAILABLE';
    createdAt: string;
    updatedAt: string;
}

import type { UpdateMenuItemDto, UpdateMenuItemResponse } from '@repo/types';

export interface UpdateMenuItemDtoRequest extends UpdateMenuItemDto {
    name?: string;
    price?: number;
    description?: string;
    category?: string;
    status?: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface UpdateMenuItemResponseDto extends UpdateMenuItemResponse {
    message: string;
    updatedItem?: {
        id: string;
        name: string;
        price: number;
        description?: string;
        category: string;
        status: 'AVAILABLE' | 'UNAVAILABLE';
    };
}
