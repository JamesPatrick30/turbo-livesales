import { Controller, Post, Body, Req, Get, Patch, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Request} from 'express';
// auth
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UseGuards } from '@nestjs/common';
//dtos
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserRequestDto, UpdateUserRoleRequestDto, UpdateUserResponse } from './dto/update.dto';
@UseGuards(AdminGuard)
@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @Post('')
    async createAdminUser(@Body() dto: CreateUserDto,@Req() req: Request) {
        const user = req.user as { id: string; email: string; role: string };
        if (user.role !== 'admin') {
            return { message: 'Unauthorized' };
        }
        return this.usersService.createAdminUser(dto, user.id);
    }

    @Get('')
    async getAllUsers(@Req() req: Request) {
        const user = req.user as { id: string; email: string; role: string };
        return this.usersService.getAllUsers(user.id);
    }

    @Patch('update/role/:id')
    async updateUserRole(@Req() req: Request,@Param('id') userId: string, @Body() dto: UpdateUserRoleRequestDto): Promise<UpdateUserResponse> {
        const user = req.user as { id: string; email: string; role: string };
        return this.usersService.updateUserRole(userId, dto, user.id);
    }

    @Put('update/:id')
    async updateUser(@Req() req: Request,@Param('id') userId: string, @Body() dto: UpdateUserRequestDto): Promise<UpdateUserResponse> {
        const user = req.user as { id: string; email: string; role: string };
        return this.usersService.updateUser(userId, dto, user.id);
    }

    @Delete('delete/:id')
    async deleteUser(@Req() req: Request,@Param('id') userId: string): Promise<{ message: string }> {
        const user = req.user as { id: string; email: string; role: string };
        return this.usersService.deleteUser(userId, user.id);
    }
}
