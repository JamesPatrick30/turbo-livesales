export interface UpdateMenuItemDto {
    name?: string;
    price?: number;
    description?: string;
    category?: string;
    status?: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface UpdateMenuItemResponse {
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