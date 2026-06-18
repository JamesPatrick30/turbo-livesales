import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// dtos
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserRequestDto, UpdateUserRoleRequestDto, UpdateUserResponse } from './dto/update.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async ahandlePasswordHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async createAdminUser(dto: CreateUserDto, adminOwnerId: string): Promise<{ message: string }> {
        const { email, password, name, role } = dto;
        const hashedPassword = await this.ahandlePasswordHash(password);

        const existingUser = await this.prisma.client.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { message: 'User with this email already exists' };
        }

        const ConvertedRole = role.toUpperCase() as 'CASHIER' | 'COOK';
        await this.prisma.client.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: ConvertedRole,
                adminOwnerId: adminOwnerId
            }
        });
        return { message: 'Admin user created successfully' };
    }

    async getAllUsers(adminOwnerId: string): Promise<any[]> {
        return this.prisma.client.user.findMany({
            where:{
                adminOwnerId: adminOwnerId
            }
        });
    }

    async updateUserRole(userId: string, dto: UpdateUserRoleRequestDto, adminOwnerId: string): Promise<{ message: string }> {
        const { role } = dto;
        const ConvertedRole = role.toUpperCase() as 'CASHIER' | 'COOK';

        const user = await this.prisma.client.user.findFirst({
            where: {
                id: userId,
                adminOwnerId: adminOwnerId
            }
        });

        if (!user) {
            return { message: 'User not found or you do not have permission to update this user' };
        }

        
        await this.prisma.client.user.update({
            where: {
                id: userId,
                adminOwnerId: adminOwnerId
            },
            data: {
                role: ConvertedRole
            }
        });

        return { message: 'User role updated successfully' };
    }

    async updateUser(userId: string, dto: UpdateUserRequestDto, adminOwnerId: string): Promise<{ message: string }> {
        const user = await this.prisma.client.user.findFirst({
            where: {
                id: userId,
                adminOwnerId: adminOwnerId
            }
        });

        if (!user) {
            return { message: 'User not found or you do not have permission to update this user' };
        }

        const { email, password, name } = dto;

        let hashedPassword: string | undefined;
        if (password) {
            hashedPassword = await this.ahandlePasswordHash(password);
        }

        await this.prisma.client.user.update({
            where: {
                id: userId,
                adminOwnerId: adminOwnerId
            },
            data: {
                email,
                password: hashedPassword,
                name
            }
        });

        return { message: 'User updated successfully' };
    }

    async deleteUser(userId: string, adminOwnerId: string): Promise<{ message: string }> {
        const user = await this.prisma.client.user.findFirst({
            where: {
                id: userId,
                adminOwnerId: adminOwnerId
            }
        });

        if (!user) {
            return { message: 'User not found or you do not have permission to delete this user' };
        }

        await this.prisma.client.user.delete({
            where: {
                id: userId,
                adminOwnerId: adminOwnerId
            }
        });

        return { message: 'User deleted successfully' };
    }
}
