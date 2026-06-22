import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginRequest, LoginResponse } from '@repo/types';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'Express';
import * as bcrypt from 'bcrypt';

//database
import { PrismaService } from '../prisma/prisma.service';

//dtos
import { LoginDto } from './dtos/login.dto';
import { SignupDto, SignupResponseDto } from './dtos/signup.dto';


@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly prismaService: PrismaService) {}

    HandleCreateToken(data: any): { accessToken: string, refreshToken: string } {
        const accessToken = this.jwtService.sign(data, { expiresIn: '1h' });
        const refreshToken = this.jwtService.sign({ ...data, type: 'refresh' }, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    handlePasswordHash(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    handlePasswordCompare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    async HandleSignup(signupDto: SignupDto): Promise<SignupResponseDto> {
        const { email, password, name } = signupDto;

        const hashedPassword = await this.handlePasswordHash(password);

        await this.prismaService.client.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'ADMIN', // Default role, you can change this as needed
                name
            },
        });

        return { message: 'User created successfully' };
    }

    async HandleLogin(loginDto: LoginDto, res: Response): Promise<LoginResponse> {
        const { email, password, role } = loginDto;


        const user = await this.prismaService.client.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await this.handlePasswordCompare(password, user.password);
        if (!isPasswordValid) {
            throw new NotFoundException('Invalid credentials');
        }

        const OwnerId = user?.adminOwnerId;

        // Sign ONCE
        const { accessToken, refreshToken } = this.HandleCreateToken({ id: user.id, email, role, OwnerId });

        // Reuse the same tokens for cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        console.log("the loging is successful");
        return { accessToken, refreshToken };
    }

    HandleRefresh(res: Response): Promise<LoginResponse> {
        // In a real application, you'd verify the refresh token and generate new tokens accordingly.
        return Promise.resolve({ accessToken: '', refreshToken: '' });
    }

    async HandleLogout(res: Response): Promise<{ message: string }> {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return { message: 'Logged out successfully' };
    }

    async HandleUpdatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const user = await this.prismaService.client.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await this.handlePasswordCompare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new NotFoundException('Invalid current password');
        }

        const hashedNewPassword = await this.handlePasswordHash(newPassword);

        await this.prismaService.client.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        return { message: 'Password updated successfully' };
    }
}
