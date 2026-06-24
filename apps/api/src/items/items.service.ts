import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

//dtos
import { CreateItemDto,CreateItemResponse  } from './dtos/create.dto';
import { UpdateMenuItemRequestDto, UpdateMenuItemResponseDto } from './dtos/update.dto';
@Injectable()
export class ItemsService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllItems(adminOwnerId: string) {
        return this.prisma.client.menuItem.findMany({
            where: {
                adminOwnerId
            },
        });
    }

    async createItem(createDto: CreateItemDto, adminOwnerId: string): Promise<CreateItemResponse> {
        const newItem = await this.prisma.client.menuItem.create({
            data: {
                adminOwnerId,
                name: createDto.name,
                price: createDto.price,
                category: createDto.category || '',
                status: createDto.status || 'AVAILABLE',
                description: createDto.description || '',
            }
        })
        return { message: 'Item created successfully', newItem };
    }

    async updateItem(itemId: string, updateDto: UpdateMenuItemRequestDto, adminOwnerId: string): Promise<UpdateMenuItemResponseDto> {

        const isHereItem = await this.prisma.client.menuItem.findUnique({
            where: { id: itemId, adminOwnerId: adminOwnerId },
        });

        if (!isHereItem) {
            throw new NotFoundException('Item not found');
        }

        const updatedItem = await this.prisma.client.menuItem.update({
            where: { id: itemId, adminOwnerId: adminOwnerId },
            data: {
                name: updateDto.name,
                price: updateDto.price,
                description: updateDto.description,
                category: updateDto.category,
                status: updateDto.status,
            }
        });

        return { message: 'Item updated successfully', updatedItem };
    }

    async deleteItem(itemId: string, adminOwnerId: string): Promise<{ message: string }> {

        const isHereItem = await this.prisma.client.menuItem.findUnique({
            where: { id: itemId, adminOwnerId: adminOwnerId },
        });

        if (!isHereItem) {
            throw new NotFoundException('Item not found');
        }

        await this.prisma.client.menuItem.delete({
            where: { id: itemId, adminOwnerId: adminOwnerId },
        });

        return { message: 'Item deleted successfully' };
    }
}