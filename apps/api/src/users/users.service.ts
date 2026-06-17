import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// dtos
import { CreateUserDto } from './dto/create.dto';
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
}
