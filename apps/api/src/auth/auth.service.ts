import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginRequest, LoginResponse } from '@repo/types';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'Express';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

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

    async HandleLogin(authRequest: LoginRequest, res: Response): Promise<LoginResponse> {
        const { email, password, role } = authRequest;

        console.log(`Login attempt for email: ${email}, role: ${role}`);
        if (password !== 'demo1234') {
            throw new NotFoundException('Invalid credentials');
        }

        // Sign ONCE
        const { accessToken, refreshToken } = this.HandleCreateToken({ email, role });

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
}
