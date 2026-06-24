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

    async createAdminUser(dto: CreateUserDto, adminOwnerId: string) {
        const { email, password, name, role } = dto;
        const hashedPassword = await this.ahandlePasswordHash(password);

        const existingUser = await this.prisma.client.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { message: 'User with this email already exists' };
        }

        const ConvertedRole = role.toUpperCase() as 'CASHIER' | 'COOK';
        const newUser = await this.prisma.client.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: ConvertedRole,
                adminOwnerId: adminOwnerId
            },select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        return { message: 'Admin user created successfully', newUser };
    }

    async getAllUsers(adminOwnerId: string): Promise<any[]> {
        return this.prisma.client.user.findMany({
            where:{
                adminOwnerId: adminOwnerId
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                // status: true,
                // joined: true,
            },
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

        const { email, password, name, role } = dto;
        const ConvertedRole = role ? role.toUpperCase() as 'CASHIER' | 'COOK' : undefined;

        const updateData: any = {};

        if (email !== undefined) updateData.email = email;
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = ConvertedRole;

        if (password) {
            updateData.password = await this.ahandlePasswordHash(password);
        }

        await this.prisma.client.user.update({
            where: {
                id: userId,
            },
            data: updateData,
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
