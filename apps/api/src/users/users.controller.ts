import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Request} from 'express';
// auth
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UseGuards } from '@nestjs/common';
//dtos
import { CreateUserDto } from './dto/create.dto';

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
        if (user.role !== 'admin') {
            return { message: 'Unauthorized' };
        }
        return this.usersService.getAllUsers(user.id);
    }
}
