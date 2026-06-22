export interface CreateMenuItemDto {
    name: string;
    price: number;
    description?: string;
    category?: string;
    status?: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface CreateMenuItemResponse {
    message: string;
    newItem?: {
        id: string;
        name: string;
        price: number;
        description?: string;
        category: string;
        status: 'AVAILABLE' | 'UNAVAILABLE';
    };
}