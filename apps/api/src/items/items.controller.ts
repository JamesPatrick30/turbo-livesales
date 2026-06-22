import { Controller, Req, Get, UseGuards, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ItemsService } from './items.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import type { Request } from 'express';
//dtos
import { CreateItemDto, CreateItemResponse } from './dtos/create.dto';
import { UpdateMenuItemRequestDto, UpdateMenuItemResponseDto } from './dtos/update.dto';

@Controller('items')
@UseGuards(AdminGuard)
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) {}

    @Get()
    async getAllItems(@Req() req: Request) {
        const adminOwnerId = ( req.user as any).id;
        return this.itemsService.getAllItems(adminOwnerId);
    }

    @Post('add')
    async createItem(
        @Req() req: Request,
        @Body() createDto: CreateItemDto
    ): Promise<CreateItemResponse> {
        const adminOwnerId = ( req.user as any).id;
        return this.itemsService.createItem(createDto, adminOwnerId);
    }

    @Put('update/:id')
    async updateItem(
        @Param('id') itemId: string, 
        @Body() updateDto: UpdateMenuItemRequestDto,
        @Req() req: Request
    ): Promise<UpdateMenuItemResponseDto> {
        const adminOwnerId = ( req.user as any).id;
        return this.itemsService.updateItem(itemId, updateDto, adminOwnerId);
    }

    @Delete('delete/:id')
    async deleteItem(
        @Param('id') itemId: string,
        @Req() req: Request
    ): Promise<{ message: string }> {
        const adminOwnerId = ( req.user as any).id;
        return this.itemsService.deleteItem(itemId, adminOwnerId);
    }
}
